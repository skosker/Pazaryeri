"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";
import { purchaseServiceLabel } from "@/lib/invoices";
import { REFUND_REASONS, parseRefundReason } from "@/lib/refund-labels";
import { RefundError, requestRefund, withdrawRefundRequest } from "@/lib/refunds";
import { sendRefundRequestAdminEmail } from "@/lib/email";

export type RefundRequestState = {
  error?: string;
  values?: { reason: string; note: string; iban: string; ibanHolder: string };
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Member: ask for a refund of a membership or corporate plan purchase. */
export async function requestRefundAction(
  purchaseId: string,
  _prev: RefundRequestState,
  formData: FormData
): Promise<RefundRequestState> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/giris?callbackUrl=/panel/faturalarim/iade/${purchaseId}`);

  const values = {
    reason: String(formData.get("reason") ?? ""),
    note: String(formData.get("note") ?? "").trim(),
    iban: String(formData.get("iban") ?? "").trim(),
    ibanHolder: String(formData.get("ibanHolder") ?? "").trim(),
  };
  const reason = parseRefundReason(values.reason);
  if (!reason) return { error: "İade gerekçesini seç.", values };
  if (values.note.length < 10) return { error: "Ne olduğunu birkaç cümleyle anlat (en az 10 karakter).", values };
  if (values.note.length > 1000) return { error: "Açıklama en fazla 1000 karakter olabilir.", values };

  const purchase = await prisma.proPurchase.findUnique({
    where: { id: purchaseId },
    select: { provider: true, plan: true, months: true, amount: true, userId: true, user: { select: { name: true } } },
  });
  if (!purchase || purchase.userId !== session.user.id) return { error: "Satın alma bulunamadı.", values };

  // A bank transfer goes back to an IBAN the member gives; card and balance payments go
  // back the way they came.
  let iban: string | null = null;
  let ibanHolder: string | null = null;
  if (purchase.provider === "havale") {
    const ibanError = validateTurkishIban(values.iban);
    if (ibanError) return { error: ibanError, values };
    if (values.ibanHolder.length < 3) return { error: "IBAN'ın sahibinin adını yaz.", values };
    iban = normalizeIban(values.iban);
    ibanHolder = values.ibanHolder;
  }

  try {
    await requestRefund({ userId: session.user.id, purchaseId, reason, note: values.note, iban, ibanHolder });
  } catch (error) {
    if (error instanceof RefundError) return { error: error.message, values };
    throw error;
  }

  if (process.env.ADMIN_EMAIL) {
    await sendRefundRequestAdminEmail({
      adminEmail: process.env.ADMIN_EMAIL,
      memberName: purchase.user.name,
      service: purchaseServiceLabel(purchase.plan, purchase.months),
      amount: Number(purchase.amount),
      reason: REFUND_REASONS[reason],
      url: `${appUrl}/admin/iadeler/${purchaseId}`,
    });
  }
  revalidatePath("/panel/faturalarim");
  revalidatePath("/admin/iadeler");
  redirect("/panel/faturalarim?iade=talep");
}

/** Member: take back a request the admin has not decided yet. */
export async function withdrawRefundAction(purchaseId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await withdrawRefundRequest(session.user.id, purchaseId);
  revalidatePath("/panel/faturalarim");
  revalidatePath("/admin/iadeler");
}
