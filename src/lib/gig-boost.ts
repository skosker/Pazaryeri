import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getSettings } from "@/lib/settings";
import { campaignPrice, livePerkPercents } from "@/lib/campaign";
import { freeBoostDays, istanbulMonth, membershipSelect, membershipTier } from "@/lib/membership";
import { assertTermsAccepted } from "@/lib/purchase-terms";

export class GigBoostError extends Error {}

export function isSponsored(sponsoredUntil: Date | null, now = new Date()): boolean {
  return sponsoredUntil !== null && sponsoredUntil > now;
}

/**
 * The seller's own live gig, or null. Only an approved, published gig can be boosted —
 * paying to put a paused or unapproved gig "at the top" would buy nothing.
 */
export async function boostableGig(userId: string, gigId: string) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    select: {
      id: true,
      slug: true,
      title: true,
      sellerId: true,
      status: true,
      published: true,
      sponsoredUntil: true,
    },
  });
  if (!gig || gig.sellerId !== userId || gig.status !== "APPROVED" || !gig.published) return null;
  // Switched off at /admin/ayarlar: no new purchases (running ones keep their time).
  if (!(await getSettings()).boostEnabled) return null;
  return gig;
}

/**
 * The open purchase for this gig, reused across page loads instead of piling up rows.
 * Price and length come from /admin/ayarlar; an open purchase made before an admin
 * changed them follows the new values.
 */
export async function findOrCreatePendingBoost(userId: string, gigId: string) {
  const { amount: boostPriceTl, days: boostDays } = await boostQuote(userId);
  const existing = await prisma.gigBoost.findFirst({
    where: { userId, gigId, status: "INITIALIZED", creditMonth: null },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (Number(existing.amount) === boostPriceTl && existing.days === boostDays) return existing;
    return prisma.gigBoost.update({
      where: { id: existing.id },
      data: { amount: boostPriceTl, days: boostDays, termsAcceptedAt: null },
    });
  }

  return prisma.gigBoost.create({
    data: { userId, gigId, amount: boostPriceTl, days: boostDays },
  });
}

/**
 * What "Öne Çıkar" costs this seller right now: the price from /admin/ayarlar, less the
 * bigger of a live campaign's boost discount and their Pro Plus discount (they do not
 * stack).
 */
export async function boostQuote(userId: string) {
  const [settings, perks, user] = await Promise.all([
    getSettings(),
    livePerkPercents(),
    prisma.user.findUnique({ where: { id: userId }, select: membershipSelect }),
  ]);
  const plusPercent = user && membershipTier(user) === "PRO_PLUS" ? settings.plusBoostDiscountPercent : 0;
  const percent = Math.max(perks.boost, plusPercent);
  return {
    amount: campaignPrice(settings.boostPriceTl, percent || null),
    listAmount: settings.boostPriceTl,
    days: settings.boostDays,
    percent,
    reason: percent === 0 ? null : plusPercent >= perks.boost ? "Pro Plus" : perks.name,
  };
}

/**
 * This month's free "Öne Çıkar" that comes with the seller's membership: how many days,
 * and whether it is already used. Null when their membership brings none.
 */
export async function freeBoostCredit(userId: string, now = new Date()) {
  const [settings, user] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({ where: { id: userId }, select: membershipSelect }),
  ]);
  const days = user ? freeBoostDays(membershipTier(user, now), settings) : 0;
  if (days <= 0) return null;
  const month = istanbulMonth(now);
  const used = await prisma.gigBoost.findUnique({
    where: { userId_creditMonth: { userId, creditMonth: month } },
    select: { gig: { select: { title: true } } },
  });
  return { days, month, usedOn: used?.gig.title ?? null };
}

/** Spend this month's free "Öne Çıkar" on one of the seller's live gigs. */
export async function redeemFreeBoostCredit(userId: string, gigId: string) {
  const gig = await boostableGig(userId, gigId);
  if (!gig) throw new GigBoostError("Bu ilan öne çıkarılamaz.");
  const credit = await freeBoostCredit(userId);
  if (!credit) throw new GigBoostError("Üyeliğinle gelen ücretsiz öne çıkarma hakkın yok.");
  if (credit.usedOn) throw new GigBoostError("Bu ayki ücretsiz öne çıkarma hakkını kullandın.");

  try {
    await prisma.$transaction(async (tx) => {
      // The (userId, creditMonth) unique key is what stops a second one this month,
      // even from two tabs at once.
      await tx.gigBoost.create({
        data: {
          userId,
          gigId,
          provider: "uyelik",
          status: "SUCCESS",
          amount: 0,
          days: credit.days,
          creditMonth: credit.month,
          activatedAt: new Date(),
        },
      });
      await extendSponsorship(tx, gigId, credit.days);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new GigBoostError("Bu ayki ücretsiz öne çıkarma hakkını kullandın.");
    }
    throw error;
  }
}

/** Push the gig's sponsorship `days` further, stacking on time it still has. */
async function extendSponsorship(tx: Prisma.TransactionClient, gigId: string, days: number) {
  const gig = await tx.gig.findUniqueOrThrow({ where: { id: gigId }, select: { sponsoredUntil: true } });
  const now = new Date();
  const from = isSponsored(gig.sponsoredUntil, now) ? gig.sponsoredUntil! : now;
  await tx.gig.update({
    where: { id: gigId },
    data: { sponsoredUntil: new Date(from.getTime() + days * 24 * 60 * 60 * 1000) },
  });
}

/**
 * Activate a paid boost. PayTR retries its notification until it gets "OK", so this must
 * be safe to run twice: the status flip is conditional and only the call that wins it
 * extends the gig. A boost bought while one is running stacks on the remaining time.
 */
export async function markBoostPaid(boostId: string) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.gigBoost.updateMany({
      where: { id: boostId, status: { not: "SUCCESS" } },
      data: { status: "SUCCESS", activatedAt: new Date() },
    });
    if (count === 0) return;

    const boost = await tx.gigBoost.findUniqueOrThrow({ where: { id: boostId }, select: { days: true, gigId: true } });
    await extendSponsorship(tx, boost.gigId, boost.days);
  });
}

export async function notifyBoostBankTransfer(userId: string, gigId: string) {
  const boost = await findOrCreatePendingBoost(userId, gigId);
  assertTermsAccepted(boost);
  return prisma.gigBoost.update({ where: { id: boost.id }, data: { provider: "havale" } });
}

export async function listPendingBoostBankTransfers() {
  return prisma.gigBoost.findMany({
    where: { provider: "havale", status: "INITIALIZED" },
    include: {
      user: { select: { name: true, email: true } },
      gig: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminConfirmBoostBankTransfer(boostId: string, adminRole: string) {
  if (adminRole !== "ADMIN") throw new GigBoostError("Yetkisiz işlem");

  const boost = await prisma.gigBoost.findUnique({ where: { id: boostId } });
  if (!boost) throw new GigBoostError("Satın alma bulunamadı");
  if (boost.status !== "INITIALIZED") throw new GigBoostError("Bu satın alma bu aşamada değil");

  await markBoostPaid(boostId);
}
