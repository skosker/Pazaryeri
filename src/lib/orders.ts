import { prisma } from "@/lib/prisma";

export class OrderError extends Error {}

export const NOT_TAKING_ORDERS = "Bu satıcı şu an yeni sipariş almıyor";

/**
 * Showcase sellers cannot log in, so an order to one would be paid for and never delivered;
 * suspended sellers must not take new work either.
 */
export function sellerTakesOrders(seller: { synthetic: boolean; suspended: boolean }): boolean {
  return !seller.synthetic && !seller.suspended;
}

export async function createOrder(buyerId: string, packageId: string) {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: { gig: { include: { seller: { select: { synthetic: true, suspended: true } } } } },
  });

  if (!pkg) throw new OrderError("Paket bulunamadı");
  if (!pkg.gig.published) {
    throw new OrderError("Bu ilan şu anda sipariş almıyor");
  }
  if (!sellerTakesOrders(pkg.gig.seller)) {
    throw new OrderError(NOT_TAKING_ORDERS);
  }
  if (pkg.gig.sellerId === buyerId) {
    throw new OrderError("Kendi hizmetinizi satın alamazsınız");
  }

  return prisma.order.create({
    data: {
      buyerId,
      gigId: pkg.gigId,
      packageId: pkg.id,
      amount: pkg.price,
    },
  });
}
