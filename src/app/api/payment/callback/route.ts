import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutForm } from "@/lib/iyzico";
import { markOrderPaid } from "@/lib/order-actions";
import type { Prisma } from "@/generated/prisma/client";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get("token");

  if (typeof token !== "string" || !token) {
    return NextResponse.redirect(`${appUrl}/panel`, 303);
  }

  const payment = await prisma.payment.findFirst({ where: { token } });
  if (!payment) {
    return NextResponse.redirect(`${appUrl}/panel`, 303);
  }

  const result = await retrieveCheckoutForm(token, payment.conversationId);
  const paymentStatus = result.paymentStatus;

  if (paymentStatus === "SUCCESS") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paymentId: result.paymentId ? String(result.paymentId) : null,
        rawResponse: result as unknown as Prisma.InputJsonValue,
      },
    });
    await markOrderPaid(payment.orderId);
    return NextResponse.redirect(`${appUrl}/siparis/${payment.orderId}`, 303);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", rawResponse: result as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.redirect(`${appUrl}/odeme/${payment.orderId}?hata=odeme-basarisiz`, 303);
}
