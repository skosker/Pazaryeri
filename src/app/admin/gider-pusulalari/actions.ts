"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { isValidTckn } from "@/lib/tax-number";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";
import { voucherTotals, type VoucherItem } from "@/lib/expense-voucher-math";

export type FormState = { error?: string };

const MAX_ITEMS = 8;

/** "2026-10-08" read as that day in Istanbul; anything else → null. */
function istanbulDay(value: FormDataEntryValue | null): Date | null {
  const v = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const date = new Date(`${v}T12:00:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "1.250,50" or "1250.50" → 1250.5; NaN when it is not a number. */
function amount(value: FormDataEntryValue | null): number {
  const v = String(value ?? "").trim().replace(/\s/g, "");
  if (!v) return NaN;
  const normalized = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v;
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

/**
 * Records a gider pusulası. The sıra no is the next free number, taken at save time, so the
 * series has no gaps; totals are recomputed here from the lines rather than trusted from the
 * form. A voucher cannot be dated in the future.
 */
export async function createVoucherAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const issuedAt = istanbulDay(formData.get("issuedAt"));
  if (!issuedAt) return { error: "Düzenleme tarihi gerekli." };
  if (issuedAt.getTime() > Date.now() + 12 * 3600_000) return { error: "Düzenleme tarihi ileri bir gün olamaz." };

  const payeeName = String(formData.get("payeeName") ?? "").trim();
  const payeeTckn = String(formData.get("payeeTckn") ?? "").replace(/\s/g, "");
  const payeeAddress = String(formData.get("payeeAddress") ?? "").trim();
  const rawIban = String(formData.get("payeeIban") ?? "").trim();
  if (payeeName.length < 3) return { error: "İşi yapanın adı soyadı gerekli." };
  if (!isValidTckn(payeeTckn)) return { error: "T.C. kimlik numarası geçersiz." };
  if (payeeAddress.length < 5) return { error: "İşi yapanın adresi gerekli." };
  let payeeIban: string | null = null;
  if (rawIban) {
    const ibanError = validateTurkishIban(rawIban);
    if (ibanError) return { error: ibanError };
    payeeIban = normalizeIban(rawIban);
  }

  const descriptions = formData.getAll("description").map((v) => String(v).trim());
  const kinds = formData.getAll("kind").map((v) => String(v).trim());
  const quantities = formData.getAll("quantity");
  const prices = formData.getAll("unitPrice");
  const items: VoucherItem[] = [];
  for (let i = 0; i < Math.min(descriptions.length, MAX_ITEMS); i++) {
    const quantityRaw = String(quantities[i] ?? "").trim();
    const priceRaw = String(prices[i] ?? "").trim();
    // A row left completely empty is skipped.
    if (!descriptions[i] && !kinds[i] && !quantityRaw && !priceRaw) continue;
    const quantity = amount(quantityRaw);
    const unitPrice = amount(priceRaw);
    if (!descriptions[i]) return { error: `${i + 1}. satırda işin mahiyeti boş.` };
    if (!(quantity > 0)) return { error: `${i + 1}. satırda adet sıfırdan büyük olmalı.` };
    if (!(unitPrice >= 0)) return { error: `${i + 1}. satırda fiyat geçersiz.` };
    items.push({ description: descriptions[i], kind: kinds[i] ?? "", quantity, unitPrice });
  }
  if (items.length === 0) return { error: "En az bir iş satırı girilmeli." };

  const withholdingPercent = amount(formData.get("withholdingPercent"));
  if (!(withholdingPercent >= 0 && withholdingPercent <= 50)) {
    return { error: "Gelir vergisi stopaj oranı %0 ile %50 arasında olmalı." };
  }
  const { gross, withholding, net } = voucherTotals(items, withholdingPercent);
  if (gross <= 0) return { error: "Toplam tutar sıfırdan büyük olmalı." };

  let id: string | null = null;
  // Two admins saving at once both read the same last number; the unique index turns the
  // loser's insert into P2002 and it simply takes the next one.
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    const last = await prisma.expenseVoucher.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    try {
      const created = await prisma.expenseVoucher.create({
        data: {
          number: (last?.number ?? 0) + 1,
          issuedAt, payeeName, payeeTckn, payeeAddress, payeeIban,
          items, gross, withholdingPercent, withholding, net,
          createdById: admin.id,
        },
        select: { id: true },
      });
      id = created.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
  if (!id) return { error: "Sıra numarası alınamadı, tekrar dene." };

  revalidatePath("/admin/gider-pusulalari");
  redirect(`/admin/gider-pusulalari/${id}?yeni=1`);
}

/** Cancels a voucher with a reason. Its sıra no stays used, so the series keeps no gaps. */
export async function cancelVoucherAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5) return { error: "İptal gerekçesi gerekli." };

  const updated = await prisma.expenseVoucher.updateMany({
    where: { id, cancelledAt: null },
    data: { cancelledAt: new Date(), cancelReason: reason },
  });
  if (updated.count === 0) return { error: "Bu gider pusulası zaten iptal edilmiş." };

  revalidatePath("/admin/gider-pusulalari");
  revalidatePath(`/admin/gider-pusulalari/${id}`);
  return {};
}
