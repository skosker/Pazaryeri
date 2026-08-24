"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { BANK_ACCOUNT_ID } from "@/lib/bank-transfer";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";

export type FormState = { error?: string; saved?: boolean };

/**
 * Writes the account shown on the checkout page. The IBAN is validated with the same
 * check-digit test sellers' payout IBANs go through — a typo here sends every buyer's
 * money to the wrong place, or nowhere at all.
 */
export async function saveBankAccountAction(
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
  const data = { accountHolder, bankName, iban };

  await prisma.bankAccount.upsert({
    where: { id: BANK_ACCOUNT_ID },
    create: { id: BANK_ACCOUNT_ID, ...data },
    update: data,
  });

  // The checkout page reads this row, so it has to be rebuilt before the next buyer
  // lands on it.
  revalidatePath("/admin/banka");
  revalidatePath("/odeme", "layout");

  return { saved: true };
}
