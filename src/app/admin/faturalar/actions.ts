"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { invoiceOwnerId, parseInvoiceKind, setInvoice } from "@/lib/invoices";

export type PdfFormState = { error?: string; ok?: boolean };

const MAX_PDF_BYTES = 4 * 1024 * 1024;

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
  // The PDF belonged to the invoice being taken back.
  await prisma.invoiceFile.deleteMany({ where: { kind: invoiceKind, recordId: id } });
  revalidatePath("/admin/faturalar");
}

/**
 * Attaches the e-Arşiv PDF of an invoice already cut (by number) so the member can download
 * it from Panel → Faturalarım. Replaces an earlier upload; only real PDFs up to 4MB.
 */
export async function uploadInvoicePdfAction(kind: string, id: string, _prev: PdfFormState, formData: FormData): Promise<PdfFormState> {
  await requireAdmin();
  const invoiceKind = parseInvoiceKind(kind);
  const file = formData.get("pdf");
  if (!invoiceKind || !(await invoiceOwnerId(invoiceKind, id))) return { error: "Kayıt bulunamadı." };
  if (!(file instanceof File) || file.size === 0) return { error: "PDF seç." };
  if (file.size > MAX_PDF_BYTES) return { error: "PDF en fazla 4 MB olabilir." };
  const data = Buffer.from(await file.arrayBuffer());
  if (data.subarray(0, 5).toString("latin1") !== "%PDF-") return { error: "Dosya PDF değil." };
  const fileName = file.name.slice(0, 120) || "fatura.pdf";
  await prisma.invoiceFile.upsert({
    where: { kind_recordId: { kind: invoiceKind, recordId: id } },
    update: { data, size: data.length, fileName, createdAt: new Date() },
    create: { kind: invoiceKind, recordId: id, data, size: data.length, fileName },
  });
  revalidatePath("/admin/faturalar");
  return { ok: true };
}

export async function removeInvoicePdfAction(kind: string, id: string) {
  await requireAdmin();
  const invoiceKind = parseInvoiceKind(kind);
  if (!invoiceKind) return;
  await prisma.invoiceFile.deleteMany({ where: { kind: invoiceKind, recordId: id } });
  revalidatePath("/admin/faturalar");
}
