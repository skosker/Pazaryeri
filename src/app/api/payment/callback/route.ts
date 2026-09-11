import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaytrNotification, type PaytrNotification } from "@/lib/paytr";
import { markOrderPaid } from "@/lib/order-actions";

/**
 * PayTR's async "bildirim" (notification) endpoint — configured once as the merchant's
 * notification URL in the PayTR panel (Ayarlar → Bildirim URL), not passed per request.
 * This is the only place an order is ever marked paid; merchant_ok_url/merchant_fail_url
 * (see src/app/odeme/[orderId]/page.tsx) only redirect the buyer's browser and carry no
 * proof of payment, so they must never trigger this side effect themselves.
 *
 * PayTR expects the literal text "OK" back — anything else (including a redirect or a
 * JSON body) reads as a delivery failure and it retries the same notification on a
 * schedule.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const fields: PaytrNotification = {
    merchant_oid: String(formData.get("merchant_oid") ?? ""),
    status: String(formData.get("status") ?? ""),
    total_amount: String(formData.get("total_amount") ?? ""),
    hash: String(formData.get("hash") ?? ""),
    failed_reason_code: formData.get("failed_reason_code")?.toString(),
    failed_reason_msg: formData.get("failed_reason_msg")?.toString(),
    test_mode: formData.get("test_mode")?.toString(),
  };

  if (!fields.merchant_oid || !fields.hash) {
    return new NextResponse("OK");
  }

  if (!verifyPaytrNotification(fields)) {
    // Wrong hash: either tampered or a stale merchant key. Ack anyway — PayTR would
    // otherwise keep retrying a request that will never verify — but skip every
    // downstream effect.
    return new NextResponse("OK");
  }

  const payment = await prisma.payment.findFirst({
    where: { conversationId: fields.merchant_oid },
  });
  if (!payment) {
    return new NextResponse("OK");
  }

  if (fields.status === "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paymentId: fields.merchant_oid,
        rawResponse: fields,
      },
    });
    await markOrderPaid(payment.orderId);
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawResponse: fields },
    });
  }

  return new NextResponse("OK");
}
