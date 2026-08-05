"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function completeMockPayment(orderId: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id) redirect("/panel");
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

  await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

  redirect(`/siparis/${orderId}`);
}

export async function failMockPayment(orderId: string) {
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id) redirect("/panel");

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
