import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { refreshReferralCredit } from "@/lib/referrals";
import { activeCampaignPercent, campaignPrice, getCampaignPricing } from "@/lib/campaign";
import { corporateOrderDiscount } from "@/lib/corporate-plans";

export class OrderError extends Error {}

export const NOT_TAKING_ORDERS = "Bu satıcı şu an yeni sipariş almıyor";

/**
 * Showcase sellers cannot log in, so an order to one would be paid for and never delivered;
 * suspended sellers must not take new work either. The one exception is a test account
 * (User.isTester, set by an admin for a testing firm): it may order from showcase gigs to
 * walk the order flow, and nobody pays — those orders are test orders throughout.
 */
export function sellerTakesOrders(
  seller: { synthetic: boolean; suspended: boolean },
  buyer?: { isTester: boolean } | null
): boolean {
  if (seller.suspended) return false;
  return !seller.synthetic || Boolean(buyer?.isTester);
}

/** An order to a showcase seller: only test accounts can place one, and no money moves. */
export const isTestOrder = (order: { gig: { seller: { synthetic: boolean } } }) => order.gig.seller.synthetic;

type Money = number | { toString(): string };

/**
 * What the buyer is charged: the package price less the first-order discount, any
 * referral credit and a corporate plan's discount.
 */
export function payableAmount(order: {
  amount: Money;
  discount: Money;
  creditDiscount?: Money;
  corporateDiscount?: Money;
}): number {
  const off = Number(order.discount) + Number(order.creditDiscount ?? 0) + Number(order.corporateDiscount ?? 0);
  return Math.round((Number(order.amount) - off) * 100) / 100;
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

/**
 * The buyer-side reductions, re-checked right before an unpaid order is paid: the
 * first-order discount first, then a referral reward on what is left, then a corporate
 * plan's discount (from this month's allowance) on what is left after both.
 */
export async function refreshOrderDiscounts(order: {
  id: string;
  buyerId: string;
  amount: Money;
  discount: Money;
  creditDiscount: Money;
  corporateDiscount: Money;
}): Promise<{ discount: number; creditDiscount: number; corporateDiscount: number }> {
  const discount = await refreshFirstOrderDiscount(order);
  const creditDiscount = await refreshReferralCredit({ ...order, discount });
  const corporateDiscount = await corporateOrderDiscount(
    order.buyerId,
    Number(order.amount) - discount - creditDiscount,
    order.id
  );
  if (corporateDiscount !== Number(order.corporateDiscount)) {
    await prisma.order.update({ where: { id: order.id }, data: { corporateDiscount } });
  }
  return { discount, creditDiscount, corporateDiscount };
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
  const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { isTester: true } });
  if (!sellerTakesOrders(pkg.gig.seller, buyer)) {
    throw new OrderError(NOT_TAKING_ORDERS);
  }
  if (pkg.gig.sellerId === buyerId) {
    throw new OrderError("Kendi hizmetinizi satın alamazsınız");
  }

  // A live seasonal campaign the gig joined lowers the price itself: the freelancer
  // chose that discount, so the order (and their payout) is simply worth less.
  const percent = activeCampaignPercent(await getCampaignPricing(), pkg.gigId);
  const amount = campaignPrice(Number(pkg.price), percent);

  // Pressing "Devam Et" again for the same package returns to the order already waiting
  // for payment instead of piling up unpaid copies; its price is brought up to date.
  const unpaid = await prisma.order.findFirst({
    where: { buyerId, packageId: pkg.id, status: "PENDING_PAYMENT" },
    orderBy: { createdAt: "desc" },
  });
  if (unpaid) {
    return prisma.order.update({
      where: { id: unpaid.id },
      data: { amount, discount: await firstOrderDiscount(buyerId, amount, unpaid.id) },
    });
  }

  return prisma.order.create({
    data: {
      buyerId,
      gigId: pkg.gigId,
      packageId: pkg.id,
      amount,
      discount: await firstOrderDiscount(buyerId, amount),
    },
  });
}
