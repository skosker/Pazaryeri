"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIban, validateTurkishIban } from "@/lib/iban";

export type FormState = { error?: string; success?: boolean };

export async function updatePayoutDetailsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) return { error: "Giriş yapmalısın" };
  if (session.user.role !== "FREELANCER") {
    return { error: "Ödeme bilgisi yalnızca freelancer hesaplarında tutulur" };
  }

  const iban = String(formData.get("iban") ?? "").trim();
  const holder = String(formData.get("ibanHolder") ?? "").trim();

  // Clearing both fields is allowed; the seller simply has no payout details on file.
  if (!iban && !holder) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { iban: null, ibanHolder: null },
    });
    revalidatePath("/panel/odeme-bilgileri");
    return { success: true };
  }

  const invalid = validateTurkishIban(iban);
  if (invalid) return { error: invalid };
  if (holder.length < 3) return { error: "Hesap sahibinin adını yazın" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { iban: normalizeIban(iban), ibanHolder: holder },
  });

  revalidatePath("/panel/odeme-bilgileri");
  return { success: true };
}
