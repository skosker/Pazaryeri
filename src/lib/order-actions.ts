import { prisma } from "@/lib/prisma";

export class OrderActionError extends Error {}

export async function getOrderForUser(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      gig: { include: { seller: true, category: true } },
      package: true,
      buyer: true,
      payment: true,
      review: true,
    },
  });

  if (!order) return null;
  if (order.buyerId !== userId && order.gig.sellerId !== userId) return null;
  return order;
}

export async function sellerStartOrder(orderId: string, sellerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { gig: true } });
  if (!order || order.gig.sellerId !== sellerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "PAID") throw new OrderActionError("Sipariş bu aşamada değil");

  return prisma.order.update({ where: { id: orderId }, data: { status: "IN_PROGRESS" } });
}

export async function sellerDeliverOrder(orderId: string, sellerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { gig: true } });
  if (!order || order.gig.sellerId !== sellerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "IN_PROGRESS") throw new OrderActionError("Sipariş bu aşamada değil");

  return prisma.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
}

export async function buyerCompleteOrder(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== buyerId) throw new OrderActionError("Yetkisiz işlem");
  if (order.status !== "DELIVERED") throw new OrderActionError("Sipariş bu aşamada değil");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED", escrowReleased: true },
  });
}
