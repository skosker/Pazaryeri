"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/order-actions";
import { sendBankTransferAdminAlertEmail, sendBankTransferSellerInfoEmail } from "@/lib/email";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const adminEmail = process.env.ADMIN_EMAIL;

export async function completeMockPayment(orderId: string) {
  const buyer = await activeUser();
  if (!buyer) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== buyer.id) redirect("/panel");
  if (order.status !== "PENDING_PAYMENT") redirect(`/siparis/${orderId}`);

  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: "iyzico-mock",
      status: "SUCCESS",
      conversationId: randomUUID(),
      paymentId: `mock_${randomUUID()}`,
      rawResponse: { mode: "mock", paymentStatus: "SUCCESS" },
    },
    update: {
      status: "SUCCESS",
      paymentId: `mock_${randomUUID()}`,
      rawResponse: { mode: "mock", paymentStatus: "SUCCESS" },
    },
  });

  await markOrderPaid(orderId);

  redirect(`/siparis/${orderId}`);
}

export async function failMockPayment(orderId: string) {
  const buyer = await activeUser();
  if (!buyer) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== buyer.id) redirect("/panel");

  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: "iyzico-mock",
      status: "FAILED",
      conversationId: randomUUID(),
      rawResponse: { mode: "mock", paymentStatus: "FAILURE" },
    },
    update: {
      status: "FAILED",
      rawResponse: { mode: "mock", paymentStatus: "FAILURE" },
    },
  });

  redirect(`/odeme/${orderId}?hata=odeme-basarisiz`);
}

export async function notifyBankTransfer(orderId: string) {
  const buyer = await activeUser();
  if (!buyer) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: { include: { seller: true } }, buyer: true },
  });
  if (!order || order.buyerId !== buyer.id) redirect("/panel");
  if (order.status !== "PENDING_PAYMENT") redirect(`/siparis/${orderId}`);

  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: "havale",
      status: "INITIALIZED",
      conversationId: randomUUID(),
      rawResponse: { mode: "havale", notifiedAt: new Date().toISOString() },
    },
    update: {
      provider: "havale",
      rawResponse: { mode: "havale", notifiedAt: new Date().toISOString() },
    },
  });

  await prisma.order.update({ where: { id: orderId }, data: { status: "PENDING_VERIFICATION" } });

  if (adminEmail) {
    await sendBankTransferAdminAlertEmail({
      adminEmail,
      buyerName: order.buyer.name,
      gigTitle: order.gig.title,
      amount: Number(order.amount),
      orderUrl: `${appUrl}/siparis/${orderId}`,
    });
  }

  await sendBankTransferSellerInfoEmail({
    sellerEmail: order.gig.seller.email,
    sellerName: order.gig.seller.name,
    gigTitle: order.gig.title,
    orderUrl: `${appUrl}/siparis/${orderId}`,
  });

  redirect(`/siparis/${orderId}`);
}
