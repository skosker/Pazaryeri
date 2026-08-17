import { prisma } from "@/lib/prisma";
import {
  sendOrderPaidEmails,
  sendOrderStartedEmail,
  sendOrderDeliveredEmail,
  sendOrderCompletedEmail,
} from "@/lib/email";

export class OrderActionError extends Error {}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const orderDetailInclude = {
  gig: { include: { seller: true, category: true } },
  package: true,
  buyer: true,
  payment: true,
  review: true,
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

export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: { include: { seller: true } }, buyer: true },
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
    include: { gig: { include: { seller: true } }, buyer: true },
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
    include: { gig: { include: { seller: true } }, buyer: true },
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
    include: { gig: { include: { seller: true } } },
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
