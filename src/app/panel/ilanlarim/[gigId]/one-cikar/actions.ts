"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { assertMockPaymentAllowed } from "@/lib/paytr";
import { revalidatePath } from "next/cache";
import {
  GigBoostError,
  boostableGig,
  findOrCreatePendingBoost,
  markBoostPaid,
  notifyBoostBankTransfer,
  redeemFreeBoostCredit,
} from "@/lib/gig-boost";

async function requireBoostableGig(gigId: string) {
  const user = await activeUser();
  if (!user) redirect(`/giris?callbackUrl=/panel/ilanlarim/${gigId}/one-cikar`);
  const gig = await boostableGig(user.id, gigId);
  if (!gig) redirect("/panel/ilanlarim");
  return { user, gig };
}

export async function completeMockBoostPayment(gigId: string) {
  assertMockPaymentAllowed();
  const { user } = await requireBoostableGig(gigId);
  const boost = await findOrCreatePendingBoost(user.id, gigId);
  await markBoostPaid(boost.id);
  redirect("/panel/ilanlarim?one-cikarildi=1");
}

export async function failMockBoostPayment(gigId: string) {
  assertMockPaymentAllowed();
  const { user } = await requireBoostableGig(gigId);
  const boost = await findOrCreatePendingBoost(user.id, gigId);
  await prisma.gigBoost.update({ where: { id: boost.id }, data: { status: "FAILED" } });
  redirect(`/panel/ilanlarim/${gigId}/one-cikar?hata=odeme-basarisiz`);
}

export async function notifyBoostBankTransferAction(gigId: string) {
  const { user } = await requireBoostableGig(gigId);
  await notifyBoostBankTransfer(user.id, gigId);
}

/** Spend this month's free "Öne Çıkar" that comes with Pro / Pro Plus. */
export async function redeemFreeBoostAction(gigId: string) {
  const { user } = await requireBoostableGig(gigId);
  try {
    await redeemFreeBoostCredit(user.id, gigId);
  } catch (error) {
    if (!(error instanceof GigBoostError)) throw error;
    redirect(`/panel/ilanlarim/${gigId}/one-cikar?hata=ucretsiz-hak`);
  }
  revalidatePath("/", "layout");
  redirect("/panel/ilanlarim?one-cikarildi=1");
}
