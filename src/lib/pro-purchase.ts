import { prisma } from "@/lib/prisma";
import { getSettings, type SiteSettings } from "@/lib/settings";
import type { Prisma } from "@/generated/prisma/client";
import {
  corpPlanPrice,
  corpPlanSelect,
  corporatePlanState,
  extendCorporatePlan,
  findOrCreatePendingCorpPurchase,
  isCorpPlan,
  type CorpPlan,
} from "@/lib/corporate-plans";
import { campaignPrice, livePerkPercents } from "@/lib/campaign";
import {
  PERIOD_MONTHS,
  extendMembership,
  membershipSelect,
  planListPrice,
  trialEligible,
  type Period,
  type Plan,
} from "@/lib/membership";

export class ProPurchaseError extends Error {}

/**
 * What a plan costs right now: the list price from /admin/ayarlar, less a live campaign's
 * Pro discount (e.g. Freelancer Günü) when there is one.
 */
export async function membershipQuote(plan: Plan, period: Period) {
  const [settings, perks] = await Promise.all([getSettings(), livePerkPercents()]);
  const list = planListPrice(plan, period, settings);
  const amount = campaignPrice(list.total, perks.pro || null);
  return { amount, listAmount: list.total, perkPercent: perks.pro, perkName: perks.name };
}

/**
 * The user's open card purchase for this plan, reused across page loads instead of
 * piling up an abandoned row every visit. One already declared as a bank transfer is
 * left alone — the admin checks the transfer against its amount — so switching plans
 * afterwards starts a new row.
 */
export async function findOrCreatePendingProPurchase(userId: string, plan: Plan, period: Period) {
  const months = PERIOD_MONTHS[period];
  const { amount } = await membershipQuote(plan, period);
  const existing = await prisma.proPurchase.findFirst({
    where: { userId, status: "INITIALIZED", provider: "paytr", plan: { in: ["PRO", "PRO_PLUS"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (existing.plan === plan && existing.months === months && Number(existing.amount) === amount) return existing;
    return prisma.proPurchase.update({ where: { id: existing.id }, data: { plan, months, amount } });
  }

  return prisma.proPurchase.create({ data: { userId, plan, months, amount } });
}

/**
 * Switch the membership on for a paid purchase. PayTR retries its notification until it
 * gets "OK", and an admin may press confirm twice, so only the call that wins the status
 * flip extends the membership.
 */
export async function markProPurchasePaid(purchaseId: string) {
  const settings = await getSettings();
  await prisma.$transaction((tx) => applyPaidPurchase(tx, purchaseId, settings));
}

/** The status flip and the membership change, inside the caller's transaction. */
async function applyPaidPurchase(tx: Prisma.TransactionClient, purchaseId: string, settings: SiteSettings) {
  const { count } = await tx.proPurchase.updateMany({
    where: { id: purchaseId, status: { not: "SUCCESS" } },
    data: { status: "SUCCESS" },
  });
  if (count === 0) return;

  const purchase = await tx.proPurchase.findUniqueOrThrow({
    where: { id: purchaseId },
    select: { plan: true, months: true, user: { select: { id: true, ...membershipSelect, ...corpPlanSelect } } },
  });
  const { plan, months, user } = purchase;
  if (isCorpPlan(plan)) {
    await tx.user.update({ where: { id: user.id }, data: extendCorporatePlan(user, plan, months ?? 1, settings) });
    return;
  }
  // A one-off purchase from before monthly/yearly plans: süresiz Pro, as it was sold.
  if (months === null) {
    await tx.user.update({ where: { id: user.id }, data: { isPro: true } });
    return;
  }
  await tx.user.update({ where: { id: user.id }, data: extendMembership(user, plan, months, settings) });
}

/**
 * A company pays for a corporate plan from its balance: the purchase is recorded, the
 * balance charged (only if it covers the price) and the plan extended, all at once.
 */
export async function payCorpPlanWithBalance(userId: string, plan: CorpPlan, period: Period) {
  const state = await corporatePlanState(userId);
  if (!state.open || !state.settings.corporateEnabled) throw new ProPurchaseError("Kurumsal paketler şu an kullanılamıyor.");
  const amount = corpPlanPrice(plan, period, state.settings).total;
  const months = PERIOD_MONTHS[period];

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.proPurchase.create({ data: { userId, plan, months, amount, provider: "bakiye" } });
    const charged = await tx.user.updateMany({
      where: { id: userId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (charged.count === 0) throw new ProPurchaseError("Bakiyen bu paket için yetersiz.");
    await tx.balanceEntry.create({
      data: {
        userId,
        kind: "PLAN",
        amount: -amount,
        purchaseId: purchase.id,
        note: `${plan === "KURUMSAL_PLUS" ? "Kurumsal Plus" : "Kurumsal"} paket · ${period === "yillik" ? "Yıllık" : "Aylık"}`,
      },
    });
    await applyPaidPurchase(tx, purchase.id, state.settings);
  });
}

/** Corporate counterpart of notifyProBankTransfer. */
export async function notifyCorpBankTransfer(userId: string, plan: CorpPlan, period: Period) {
  const purchase = await findOrCreatePendingCorpPurchase(userId, plan, period);
  return prisma.proPurchase.update({ where: { id: purchase.id }, data: { provider: "havale" } });
}

/** Free Pro for `proTrialDays`, once per freelancer who has never been a member. */
export async function startProTrial(userId: string) {
  const settings = await getSettings();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, proTrialUsedAt: true, ...membershipSelect },
  });
  if (!user || user.role !== "FREELANCER" || !trialEligible(user, settings)) {
    throw new ProPurchaseError("Ücretsiz deneme hakkın bulunmuyor.");
  }
  const now = new Date();
  // Conditional so two quick clicks cannot both start (or restart) the trial.
  const { count } = await prisma.user.updateMany({
    where: { id: userId, isPro: false, proUntil: null, proTrialUsedAt: null },
    data: {
      proUntil: new Date(now.getTime() + settings.proTrialDays * 24 * 60 * 60 * 1000),
      proPlus: false,
      proTrialUsedAt: now,
    },
  });
  if (count === 0) throw new ProPurchaseError("Ücretsiz deneme hakkın bulunmuyor.");
}

/**
 * The freelancer declared a bank transfer for a plan — same shape as an order's
 * Havale/EFT notification: the purchase stays INITIALIZED with provider "havale" until
 * an admin confirms it below.
 */
export async function notifyProBankTransfer(userId: string, plan: Plan, period: Period) {
  const purchase = await findOrCreatePendingProPurchase(userId, plan, period);
  return prisma.proPurchase.update({ where: { id: purchase.id }, data: { provider: "havale" } });
}

/** A bank transfer this user declared that an admin has not confirmed yet (Pro or corporate plans). */
export async function pendingProBankTransfer(userId: string, corporate = false) {
  return prisma.proPurchase.findFirst({
    where: {
      userId,
      provider: "havale",
      status: "INITIALIZED",
      plan: { in: corporate ? ["KURUMSAL", "KURUMSAL_PLUS"] : ["PRO", "PRO_PLUS"] },
    },
    orderBy: { createdAt: "desc" },
    select: { plan: true, months: true, amount: true, createdAt: true },
  });
}

export async function listPendingProBankTransfers() {
  return prisma.proPurchase.findMany({
    where: { provider: "havale", status: "INITIALIZED" },
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminConfirmProBankTransfer(purchaseId: string, adminRole: string) {
  if (adminRole !== "ADMIN") throw new ProPurchaseError("Yetkisiz işlem");

  const purchase = await prisma.proPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) throw new ProPurchaseError("Satın alma bulunamadı");
  if (purchase.status !== "INITIALIZED") throw new ProPurchaseError("Bu satın alma bu aşamada değil");

  await markProPurchasePaid(purchaseId);
}
