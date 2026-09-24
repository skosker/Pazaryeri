import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { campaignPrice, livePerkPercents } from "@/lib/campaign";

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
  const [{ boostPriceTl: basePrice, boostDays }, perks] = await Promise.all([getSettings(), livePerkPercents()]);
  // A live campaign may discount "Öne Çıkar" for its duration.
  const boostPriceTl = campaignPrice(basePrice, perks.boost || null);
  const existing = await prisma.gigBoost.findFirst({
    where: { userId, gigId, status: "INITIALIZED" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (Number(existing.amount) === boostPriceTl && existing.days === boostDays) return existing;
    return prisma.gigBoost.update({
      where: { id: existing.id },
      data: { amount: boostPriceTl, days: boostDays },
    });
  }

  return prisma.gigBoost.create({
    data: { userId, gigId, amount: boostPriceTl, days: boostDays },
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

    const boost = await tx.gigBoost.findUniqueOrThrow({
      where: { id: boostId },
      select: { days: true, gig: { select: { id: true, sponsoredUntil: true } } },
    });
    const now = new Date();
    const from = isSponsored(boost.gig.sponsoredUntil, now) ? boost.gig.sponsoredUntil! : now;
    await tx.gig.update({
      where: { id: boost.gig.id },
      data: { sponsoredUntil: new Date(from.getTime() + boost.days * 24 * 60 * 60 * 1000) },
    });
  });
}

export async function notifyBoostBankTransfer(userId: string, gigId: string) {
  const boost = await findOrCreatePendingBoost(userId, gigId);
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
