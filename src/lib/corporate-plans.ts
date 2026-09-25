import { prisma } from "@/lib/prisma";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { PERIOD_MONTHS, extendPeriod, istanbulMonth, type Period } from "@/lib/membership";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Kurumsal abonelik paketleri: a company buyer pays monthly or yearly for a discount on
 * its orders (capped per month, Prosinta absorbs it) and a bonus on balance top-ups.
 * Shown only while both the corporate package and these plans are switched on at
 * /admin/ayarlar. Membership lives on the user as corpPlan / corpPlanUntil and lapses by
 * itself when the period ends.
 */

export type CorpPlan = "KURUMSAL" | "KURUMSAL_PLUS";

export const CORP_PLAN_LABEL: Record<CorpPlan, string> = { KURUMSAL: "Kurumsal", KURUMSAL_PLUS: "Kurumsal Plus" };
export const CORP_PLAN_SLUG: Record<CorpPlan, string> = { KURUMSAL: "kurumsal", KURUMSAL_PLUS: "kurumsal-plus" };

export function parseCorpPlan(value: unknown): CorpPlan | null {
  if (value === "kurumsal") return "KURUMSAL";
  if (value === "kurumsal-plus") return "KURUMSAL_PLUS";
  return null;
}

export function isCorpPlan(plan: string): plan is CorpPlan {
  return plan === "KURUMSAL" || plan === "KURUMSAL_PLUS";
}

export const corpPlanSelect = { corpPlan: true, corpPlanUntil: true } satisfies Prisma.UserSelect;
export type CorpPlanFields = { corpPlan: string | null; corpPlanUntil: Date | null };

export function corpPlansOpen(settings: SiteSettings): boolean {
  return settings.corporateEnabled && settings.corporatePlansEnabled;
}

/** The corporate plan in force right now (null: none, or the plans are switched off). */
export function corpTier(user: CorpPlanFields, settings: SiteSettings, now = new Date()): CorpPlan | null {
  if (!corpPlansOpen(settings)) return null;
  if (!user.corpPlan || !isCorpPlan(user.corpPlan) || !user.corpPlanUntil || user.corpPlanUntil <= now) return null;
  return user.corpPlan;
}

export function corpMonthlyPrice(plan: CorpPlan, settings: SiteSettings): number {
  return plan === "KURUMSAL_PLUS" ? settings.corpPlusMonthlyTl : settings.corpMonthlyTl;
}

/** What each tier gives; the free tier ("Temel") gives none of these. */
export function corpPerks(tier: CorpPlan | null, settings: SiteSettings) {
  if (tier === "KURUMSAL_PLUS") {
    return {
      orderPercent: settings.corpPlusOrderDiscountPercent,
      orderMaxTl: settings.corpPlusOrderDiscountMaxTl,
      bonusPercent: settings.corpPlusTopUpBonusPercent,
    };
  }
  if (tier === "KURUMSAL") {
    return {
      orderPercent: settings.corpOrderDiscountPercent,
      orderMaxTl: settings.corpOrderDiscountMaxTl,
      bonusPercent: settings.corpTopUpBonusPercent,
    };
  }
  return { orderPercent: 0, orderMaxTl: 0, bonusPercent: 0 };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Price of a plan: monthly, or twelve months at the yearly discount (shared with Pro). */
export function corpPlanPrice(plan: CorpPlan, period: Period, settings: SiteSettings) {
  const monthly = corpMonthlyPrice(plan, settings);
  if (period === "aylik") return { total: monthly, perMonth: monthly, listPerMonth: monthly };
  const perMonth = round2((monthly * (100 - settings.yearlyDiscountPercent)) / 100);
  return { total: round2(perMonth * 12), perMonth, listPerMonth: monthly };
}

function monthStart(now = new Date()): Date {
  // Midnight on the 1st in Istanbul (UTC+3, no daylight saving since 2016).
  const [y, m] = istanbulMonth(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, -3));
}

/**
 * The corporate discount on an order, from what is left of this month's allowance:
 * orders this buyer has paid for this month (not cancelled) count against it. Applied to
 * what remains after the first-order and referral reductions.
 */
export async function corporateOrderDiscount(
  buyerId: string,
  base: number,
  excludeOrderId?: string
): Promise<number> {
  const [settings, user] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({ where: { id: buyerId }, select: { companyName: true, ...corpPlanSelect } }),
  ]);
  if (!user?.companyName) return 0;
  const perks = corpPerks(corpTier(user, settings), settings);
  if (perks.orderPercent <= 0 || base <= 0) return 0;

  const used = await prisma.order.aggregate({
    _sum: { corporateDiscount: true },
    where: {
      buyerId,
      status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] },
      createdAt: { gte: monthStart() },
      ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
    },
  });
  const left = Math.max(0, perks.orderMaxTl - Number(used._sum.corporateDiscount ?? 0));
  return round2(Math.min(Math.round(base * perks.orderPercent) / 100, left));
}

/** The user's plan and what they get from it now, for the panel pages. */
export async function corporatePlanState(userId: string) {
  const [settings, user] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({ where: { id: userId }, select: { companyName: true, ...corpPlanSelect } }),
  ]);
  const tier = user ? corpTier(user, settings) : null;
  return { open: corpPlansOpen(settings) && Boolean(user?.companyName), tier, until: tier ? user!.corpPlanUntil : null, settings };
}

/**
 * Where a paid corporate purchase leaves the company: a new period from now plus what is
 * left of the running one, converted by the two plans' monthly prices.
 */
export function extendCorporatePlan(
  user: CorpPlanFields,
  plan: CorpPlan,
  months: number,
  settings: SiteSettings,
  now = new Date()
): { corpPlan: CorpPlan; corpPlanUntil: Date } {
  const running = user.corpPlan && isCorpPlan(user.corpPlan) && user.corpPlanUntil && user.corpPlanUntil > now;
  const current = running ? corpMonthlyPrice(user.corpPlan as CorpPlan, settings) : 0;
  return {
    corpPlan: plan,
    corpPlanUntil: extendPeriod(running ? user.corpPlanUntil : null, current, corpMonthlyPrice(plan, settings), months, now),
  };
}

/** The company's open (card or not-yet-declared) purchase for this plan, reused across visits. */
export async function findOrCreatePendingCorpPurchase(userId: string, plan: CorpPlan, period: Period) {
  const settings = await getSettings();
  const months = PERIOD_MONTHS[period];
  const amount = corpPlanPrice(plan, period, settings).total;
  const existing = await prisma.proPurchase.findFirst({
    where: { userId, status: "INITIALIZED", provider: "paytr", plan: { in: ["KURUMSAL", "KURUMSAL_PLUS"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (existing.plan === plan && existing.months === months && Number(existing.amount) === amount) return existing;
    return prisma.proPurchase.update({ where: { id: existing.id }, data: { plan, months, amount, termsAcceptedAt: null } });
  }
  return prisma.proPurchase.create({ data: { userId, plan, months, amount } });
}
