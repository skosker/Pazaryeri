import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export class ProPurchaseError extends Error {}


/**
 * The user's open purchase, reused across page loads instead of piling up an
 * abandoned row every time the Pro page is visited without paying.
 */
export async function findOrCreatePendingProPurchase(userId: string) {
  // Prosinta Pro's one-time price (for buyers and freelancers) is set at /admin/ayarlar.
  const { proPriceTl } = await getSettings();
  const existing = await prisma.proPurchase.findFirst({
    where: { userId, status: "INITIALIZED" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    // An open purchase from before an admin changed the price follows the new price.
    if (Number(existing.amount) === proPriceTl) return existing;
    return prisma.proPurchase.update({ where: { id: existing.id }, data: { amount: proPriceTl } });
  }

  return prisma.proPurchase.create({
    data: { userId, amount: proPriceTl },
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

/**
 * The buyer/freelancer declared a bank transfer for their Pro purchase — same shape as
 * an order's Havale/EFT notification, but there is no separate "pending verification"
 * status here: the purchase itself stays INITIALIZED with provider "havale" until an
 * admin confirms it below.
 */
export async function notifyProBankTransfer(userId: string) {
  const purchase = await findOrCreatePendingProPurchase(userId);
  return prisma.proPurchase.update({ where: { id: purchase.id }, data: { provider: "havale" } });
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
