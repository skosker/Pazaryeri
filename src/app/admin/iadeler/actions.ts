"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { purchaseServiceLabel } from "@/lib/invoices";
import {
  REFUND_METHOD_LABEL,
  parseInvoiceAction,
  parseMembershipChange,
  parseRefundMethod,
  parseRefundReason,
  parseTlAmount,
} from "@/lib/refund-labels";
import { RefundError, getRefundCase, refundPurchase, rejectRefund, setRefundInvoiceAction } from "@/lib/refunds";
import { sendRefundDecisionEmail } from "@/lib/email";

export type DecisionState = { error?: string };

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function revalidate(purchaseId: string) {
  revalidatePath("/admin/iadeler");
  revalidatePath(`/admin/iadeler/${purchaseId}`);
  revalidatePath("/admin/faturalar");
  revalidatePath("/admin/gelir");
  revalidatePath("/panel/faturalarim");
}

/** Records the refund (the money already sent back, or credited to a corporate balance here). */
export async function refundAction(purchaseId: string, _prev: DecisionState, formData: FormData): Promise<DecisionState> {
  const admin = await requireAdmin();
  const c = await getRefundCase(purchaseId);
  if (!c) return { error: "Satın alma bulunamadı." };

  const amount = parseTlAmount(String(formData.get("amount") ?? ""));
  if (!(amount > 0)) return { error: "İade tutarını gir." };
  const method = parseRefundMethod(formData.get("method"));
  if (!method) return { error: "İade yöntemini seç." };
  const membership = parseMembershipChange(formData.get("membership"));
  if (!membership) return { error: "Üyeliğe ne olacağını seç." };
  const reference = String(formData.get("reference") ?? "").trim() || null;
  if (method !== "bakiye" && (!reference || reference.length < 3)) {
    return { error: "Dekont ya da işlem numarasını gir; iadeyi gönderdikten sonra kaydet." };
  }
  // An invoice already cut has to be dealt with too; none cut means nothing to do.
  const invoiceAction = c.invoiceNo ? parseInvoiceAction(formData.get("invoiceAction")) : "kesilmedi";
  if (!invoiceAction || (c.invoiceNo && invoiceAction === "kesilmedi")) {
    return { error: "Kesilmiş faturaya ne yapıldığını seç." };
  }
  const reason = parseRefundReason(formData.get("reason"));
  const note = String(formData.get("note") ?? "").trim() || null;

  try {
    const done = await refundPurchase({
      purchaseId,
      adminId: admin.id,
      amount,
      method,
      reference,
      invoiceAction,
      membership,
      reason,
      note,
    });
    await sendRefundDecisionEmail({
      to: done.user.email,
      name: done.user.name,
      service: purchaseServiceLabel(done.plan, done.months),
      refunded: true,
      amount: done.refundAmount,
      methodLabel: REFUND_METHOD_LABEL[method],
      url: `${appUrl}/panel/faturalarim`,
    });
  } catch (error) {
    if (error instanceof RefundError) return { error: error.message };
    throw error;
  }
  revalidate(purchaseId);
  redirect(`/admin/iadeler/${purchaseId}?sonuc=iade`);
}

/** Turns a member's request down with the reason they will see. */
export async function rejectAction(purchaseId: string, _prev: DecisionState, formData: FormData): Promise<DecisionState> {
  const admin = await requireAdmin();
  const reason = String(formData.get("rejectReason") ?? "").trim();
  if (reason.length < 10) return { error: "Üyenin göreceği gerekçeyi yaz (en az 10 karakter)." };
  if (!(await rejectRefund(purchaseId, admin.id, reason))) return { error: "Bu talep zaten sonuçlanmış." };

  const c = await getRefundCase(purchaseId);
  if (c) {
    await sendRefundDecisionEmail({
      to: c.user.email,
      name: c.user.name,
      service: purchaseServiceLabel(c.plan, c.months),
      refunded: false,
      rejectReason: reason,
      url: `${appUrl}/panel/faturalarim`,
    });
  }
  revalidate(purchaseId);
  redirect(`/admin/iadeler/${purchaseId}?sonuc=red`);
}

/** The invoice step after a refund, e.g. the awaited iade faturası has arrived. */
export async function updateInvoiceActionAction(purchaseId: string, formData: FormData) {
  await requireAdmin();
  const invoiceAction = parseInvoiceAction(formData.get("invoiceAction"));
  if (!invoiceAction) return;
  await setRefundInvoiceAction(purchaseId, invoiceAction);
  revalidate(purchaseId);
}
