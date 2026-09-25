"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { parseInvoiceKind, setInvoice } from "@/lib/invoices";

export async function markInvoicedAction(kind: string, id: string, formData: FormData) {
  await requireAdmin();
  const invoiceKind = parseInvoiceKind(kind);
  const invoiceNo = String(formData.get("invoiceNo") ?? "").trim().slice(0, 64);
  if (!invoiceKind || !invoiceNo) return;
  await setInvoice(invoiceKind, id, invoiceNo);
  revalidatePath("/admin/faturalar");
}

export async function clearInvoiceAction(kind: string, id: string) {
  await requireAdmin();
  const invoiceKind = parseInvoiceKind(kind);
  if (!invoiceKind) return;
  await setInvoice(invoiceKind, id, null);
  revalidatePath("/admin/faturalar");
}
