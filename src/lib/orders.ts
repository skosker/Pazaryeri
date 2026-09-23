import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export class OrderError extends Error {}

export const NOT_TAKING_ORDERS = "Bu satıcı şu an yeni sipariş almıyor";

/**
 * Showcase sellers cannot log in, so an order to one would be paid for and never delivered;
 * suspended sellers must not take new work either.
 */
export function sellerTakesOrders(seller: { synthetic: boolean; suspended: boolean }): boolean {
  return !seller.synthetic && !seller.suspended;
}

type Money = number | { toString(): string };

/** What the buyer is charged: the package price less any first-order discount. */
export function payableAmount(order: { amount: Money; discount: Money }): number {
  return Math.round((Number(order.amount) - Number(order.discount)) * 100) / 100;
}

/**
 * The first-order discount this buyer gets on `amount` (0 when not eligible). "First" means
 * no other order of theirs has got past unpaid — paid, awaiting bank-transfer check, in
 * progress or done — so abandoning an unpaid order does not use the discount up.
 */
export async function firstOrderDiscount(
  buyerId: string,
  amount: number,
  excludeOrderId?: string
): Promise<number> {
  const offer = await firstOrderOffer(buyerId, excludeOrderId);
  if (!offer) return 0;
  const discount = Math.round(amount * offer.percent) / 100;
  return Math.min(discount, offer.maxTl);
}

/**
 * The first-order offer this visitor would get, for showing it before they order: null
 * when it is switched off or already used. A signed-out visitor (null) is shown the offer.
 */
export async function firstOrderOffer(
  buyerId: string | null,
  excludeOrderId?: string
): Promise<{ percent: number; maxTl: number } | null> {
  const { firstOrderEnabled, firstOrderPercent, firstOrderMaxTl } = await getSettings();
  if (!firstOrderEnabled || firstOrderPercent <= 0) return null;
  if (buyerId) {
    const earlier = await prisma.order.count({
      where: {
        buyerId,
        status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] },
        ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
      },
    });
    if (earlier > 0) return null;
  }
  return { percent: firstOrderPercent, maxTl: firstOrderMaxTl };
}

/**
 * Re-check an unpaid order's discount right before it is paid: a buyer with two unpaid
 * orders must not get the first-order discount on both, and one who abandoned their
 * first order should still get it on the next. Returns the up-to-date discount.
 */
export async function refreshFirstOrderDiscount(order: {
  id: string;
  buyerId: string;
  amount: Money;
  discount: Money;
}): Promise<number> {
  const discount = await firstOrderDiscount(order.buyerId, Number(order.amount), order.id);
  if (discount !== Number(order.discount)) {
    await prisma.order.update({ where: { id: order.id }, data: { discount } });
  }
  return discount;
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
      discount: await firstOrderDiscount(buyerId, Number(pkg.price)),
    },
  });
}
