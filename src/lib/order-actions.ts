import { prisma } from "@/lib/prisma";
import {
  sendOrderPaidEmails,
  sendOrderStartedEmail,
  sendOrderDeliveredEmail,
  sendOrderCompletedEmail,
} from "@/lib/email";

export class OrderActionError extends Error {}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Order pages show who is on each side of the order, so both users come along with the
 * row. Prisma returns whole rows unless told otherwise, and User carries passwordHash,
 * email and the seller's IBAN — one prop-pass into a client component would serialise
 * all of that into the page source. Listing the fields keeps that from being possible.
 *
 * Payment is left out on the same grounds: its rawResponse is the whole iyzico payload,
 * and nothing that reads an order needs it.
 */
const orderDetailInclude = {
  gig: {
    select: { slug: true, title: true, sellerId: true, seller: { select: { name: true } } },
  },
  package: { select: { name: true, deliveryDays: true } },
  buyer: { select: { name: true } },
  review: { select: { rating: true, comment: true } },
} as const;

/** Just enough of the two sides to address the notification emails. */
const notificationSelect = {
  gig: {
    select: { title: true, sellerId: true, seller: { select: { name: true, email: true } } },
  },
  buyer: { select: { name: true, email: true } },
} as const;

export async function getOrderForUser(orderId: string, userId: string, role?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderDetailInclude,
  });

  if (!order) return null;
  if (role === "ADMIN") return order;
  if (order.buyerId !== userId && order.gig.sellerId !== userId) return null;
  return order;
}

export async function listPendingBankTransfers() {
  return prisma.order.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: orderDetailInclude,
    orderBy: { updatedAt: "asc" },
  });
}

/**
 * Every bank-transfer order — those still awaiting approval and those already approved —
 * for the admin Havale/EFT screen, optionally narrowed to a date range. A transfer is a
 * bank transfer if its payment went through the "havale" provider; the status column then
 * says whether it is still pending or has been approved.
 */
export async function listBankTransfers(opts?: { from?: Date; to?: Date }) {
  const createdAt =
    opts?.from || opts?.to
      ? {
          ...(opts.from ? { gte: opts.from } : {}),
          ...(opts.to ? { lte: opts.to } : {}),
        }
      : undefined;

  return prisma.order.findMany({
    where: {
      payment: { provider: "havale" },
      ...(createdAt ? { createdAt } : {}),
    },
    include: orderDetailInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: notificationSelect,
  });
  if (!order) throw new OrderActionError("Sipariş bulunamadı");

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

  await sendOrderPaidEmails({
    buyerEmail: order.buyer.email,
    buyerName: order.buyer.name,
    sellerEmail: order.gig.seller.email,
    sellerName: order.gig.seller.name,
    gigTitle: order.gig.title,
    amount: Number(order.amount),
    orderUrl: `${appUrl}/siparis/${orderId}`,
  });

  return updated;
}

export async function adminConfirmBankTransfer(orderId: string, adminRole: string) {
  if (adminRole !== "ADMIN") throw new OrderActionError("Yetkisiz işlem");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new OrderActionError("Sipariş bulunamadı");
  if (order.status !== "PENDING_VERIFICATION") throw new OrderActionError("Sipariş bu aşamada değil");

  await prisma.payment.update({ where: { orderId }, data: { status: "SUCCESS" } });

  return markOrderPaid(orderId);
}

export async function sellerStartOrder(orderId: string, sellerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: notificationSelect,
  });
  if (!order || order.gig.sellerId !== sellerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "PAID") throw new OrderActionError("Sipariş bu aşamada değil");

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "IN_PROGRESS" } });

  await sendOrderStartedEmail({
    buyerEmail: order.buyer.email,
    buyerName: order.buyer.name,
    gigTitle: order.gig.title,
    orderUrl: `${appUrl}/siparis/${orderId}`,
  });

  return updated;
}

export async function sellerDeliverOrder(orderId: string, sellerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: notificationSelect,
  });
  if (!order || order.gig.sellerId !== sellerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "IN_PROGRESS") throw new OrderActionError("Sipariş bu aşamada değil");

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });

  await sendOrderDeliveredEmail({
    buyerEmail: order.buyer.email,
    buyerName: order.buyer.name,
    gigTitle: order.gig.title,
    orderUrl: `${appUrl}/siparis/${orderId}`,
  });

  return updated;
}

export async function buyerCompleteOrder(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      gig: {
        select: {
          title: true,
          sellerId: true,
          // The payout row copies the account details in, so they are needed here.
          seller: { select: { name: true, email: true, iban: true, ibanHolder: true } },
        },
      },
    },
  });
  if (!order || order.buyerId !== buyerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "DELIVERED") throw new OrderActionError("Sipariş bu aşamada değil");

  const amount = order.amount;

  // The payout row is what the admin payout screen works from, so it has to appear in
  // the same transaction that releases the escrow — otherwise a crash in between would
  // mark the money released with nothing recording that it is owed. Seller bank details
  // are copied in: they may change later, but a transfer that already went out must
  // keep the details it was actually sent to.
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", escrowReleased: true },
    }),
    prisma.payout.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId,
        sellerId: order.gig.sellerId,
        gross: amount,
        commission: 0,
        net: amount,
        iban: order.gig.seller.iban,
        ibanHolder: order.gig.seller.ibanHolder,
      },
    }),
  ]);

  await sendOrderCompletedEmail({
    sellerEmail: order.gig.seller.email,
    sellerName: order.gig.seller.name,
    gigTitle: order.gig.title,
    amount: Number(order.amount),
    orderUrl: `${appUrl}/siparis/${orderId}`,
  });

  return updated;
}
