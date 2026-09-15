import { prisma } from "@/lib/prisma";

export class ProPurchaseError extends Error {}

/** Prosinta Pro's one-time price, for both buyers and freelancers. */
export const PRO_PRICE_TL = 1000;

/**
 * The user's open purchase, reused across page loads instead of piling up an
 * abandoned row every time the Pro page is visited without paying.
 */
export async function findOrCreatePendingProPurchase(userId: string) {
  const existing = await prisma.proPurchase.findFirst({
    where: { userId, status: "INITIALIZED" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  return prisma.proPurchase.create({
    data: { userId, amount: PRO_PRICE_TL },
  });
}

export async function markProPurchasePaid(purchaseId: string) {
  const purchase = await prisma.proPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) throw new ProPurchaseError("Satın alma bulunamadı");

  await prisma.$transaction([
    prisma.proPurchase.update({ where: { id: purchaseId }, data: { status: "SUCCESS" } }),
    prisma.user.update({ where: { id: purchase.userId }, data: { isPro: true } }),
  ]);
}
