"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";

export type FormState = { error?: string; saved?: boolean };

/**
 * Adds a company account shown on the checkout page. The IBAN is validated with the same
 * check-digit test sellers' payout IBANs go through — a typo here sends every buyer's
 * money to the wrong place, or nowhere at all. A bank/IBAN pair already on file is
 * rejected so the list does not fill up with duplicates.
 */
export async function addBankAccountAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const accountHolder = String(formData.get("accountHolder") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const rawIban = String(formData.get("iban") ?? "");

  if (!accountHolder) return { error: "Hesap sahibi gerekli" };
  if (!bankName) return { error: "Banka adı gerekli" };

  const ibanError = validateTurkishIban(rawIban);
  if (ibanError) return { error: ibanError };

  const iban = normalizeIban(rawIban);

  const existing = await prisma.bankAccount.findFirst({ where: { iban } });
  if (existing) return { error: "Bu IBAN zaten ekli" };

  await prisma.bankAccount.create({ data: { accountHolder, bankName, iban } });

  revalidatePath("/admin/banka");
  // The checkout page lists these accounts, so it has to be rebuilt.
  revalidatePath("/odeme", "layout");

  return { saved: true };
}

/** Removes a company account. The checkout page stops showing it immediately. */
export async function deleteBankAccountAction(id: string) {
  await requireAdmin();

  await prisma.bankAccount.delete({ where: { id } });

  revalidatePath("/admin/banka");
  revalidatePath("/odeme", "layout");
}

/**
 * Flips a company account between active and inactive. A pasife (inactive) account
 * disappears from checkout immediately but keeps its details, so it can be turned back
 * on later without re-entering the IBAN — the reversible alternative to deleting it.
 */
export async function toggleBankAccountActiveAction(id: string) {
  await requireAdmin();

  const account = await prisma.bankAccount.findUnique({ where: { id }, select: { active: true } });
  if (!account) return;

  await prisma.bankAccount.update({ where: { id }, data: { active: !account.active } });

  revalidatePath("/admin/banka");
  revalidatePath("/odeme", "layout");
}
