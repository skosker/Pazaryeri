"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";
import { readWorkbookRows, findColumn, parseAmount, parseRowDate, cellString } from "@/lib/xlsx-import";

export type ImportResult = {
  error?: string;
  added?: number;
  failed?: { row: number; reason: string }[];
};

const NAME_COLUMNS = ["Ad Soyad", "Ad", "İsim", "Freelancer", "Freelancer Adı"];
const IBAN_COLUMNS = ["IBAN", "Iban", "Hesap No"];
const AMOUNT_COLUMNS = ["Tutar", "Ücret", "Ödeme", "Ödeme Tutarı", "Miktar"];
const DATE_COLUMNS = ["Tarih", "Ödeme Tarihi", "Tarihi"];

/**
 * Reads an uploaded .xlsx and writes one FreelancerPayout row per spreadsheet row. Bad
 * rows (missing name, invalid IBAN, unreadable amount) are skipped and reported rather
 * than aborting the whole file — a typo in row 40 of 200 should not cost the other 199.
 */
export async function importFreelancerPayoutsAction(
  _prevState: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("dosya");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bir Excel dosyası seç" };
  }

  let rows;
  try {
    rows = await readWorkbookRows(file);
  } catch {
    return { error: "Dosya okunamadı — geçerli bir .xlsx olduğundan emin ol" };
  }

  if (rows.length === 0) return { error: "Dosyada okunacak satır bulunamadı" };

  const now = new Date();
  const failed: { row: number; reason: string }[] = [];
  const toCreate: { name: string; iban: string; amount: number; paidAt: Date }[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const name = cellString(findColumn(row, NAME_COLUMNS));
    const rawIban = cellString(findColumn(row, IBAN_COLUMNS));
    const amount = parseAmount(findColumn(row, AMOUNT_COLUMNS));
    const paidAt = parseRowDate(findColumn(row, DATE_COLUMNS), now);

    if (!name) return failed.push({ row: rowNumber, reason: "Ad Soyad boş" });

    const ibanError = validateTurkishIban(rawIban);
    if (ibanError) return failed.push({ row: rowNumber, reason: `IBAN: ${ibanError}` });

    if (amount === null) return failed.push({ row: rowNumber, reason: "Tutar okunamadı" });

    toCreate.push({ name, iban: normalizeIban(rawIban), amount, paidAt });
  });

  for (const payout of toCreate) {
    await prisma.freelancerPayout.create({ data: payout });
  }

  revalidatePath("/admin/hakedis-odemeleri");
  return { added: toCreate.length, failed };
}
