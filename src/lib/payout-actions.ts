"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export type PayoutFormState = { error?: string; success?: string };

export async function listPendingPayouts() {
  return prisma.payout.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      seller: { select: { name: true, email: true, iban: true, ibanHolder: true } },
      order: { include: { gig: { select: { title: true } } } },
    },
  });
}

export async function listRecentPaidPayouts(take = 20) {
  return prisma.payout.findMany({
    where: { status: "PAID" },
    orderBy: { paidAt: "desc" },
    take,
    include: {
      seller: { select: { name: true } },
      order: { include: { gig: { select: { title: true } } } },
    },
  });
}

/**
 * Records that the transfer was made by hand at the bank. The payout keeps whichever
 * account details it was created with, so the row stays a faithful record of where the
 * money was actually sent even if the seller edits their profile afterwards.
 */
export async function markPayoutPaidAction(
  _prevState: PayoutFormState,
  formData: FormData
): Promise<PayoutFormState> {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!payoutId) return { error: "Ödeme kaydı bulunamadı" };

  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return { error: "Ödeme kaydı bulunamadı" };
  if (payout.status === "PAID") return { error: "Bu hakediş zaten ödenmiş" };

  await prisma.payout.update({
    where: { id: payoutId },
    data: { status: "PAID", paidAt: new Date(), note: note || null },
  });

  revalidatePath("/admin/hakedisler");
  revalidatePath("/panel/odeme-bilgileri");
  return { success: "Ödendi olarak işaretlendi." };
}
