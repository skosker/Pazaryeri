"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import {
  boostableGig,
  findOrCreatePendingBoost,
  markBoostPaid,
  notifyBoostBankTransfer,
} from "@/lib/gig-boost";

async function requireBoostableGig(gigId: string) {
  const user = await activeUser();
  if (!user) redirect(`/giris?callbackUrl=/panel/ilanlarim/${gigId}/one-cikar`);
  const gig = await boostableGig(user.id, gigId);
  if (!gig) redirect("/panel/ilanlarim");
  return { user, gig };
}

export async function completeMockBoostPayment(gigId: string) {
  const { user } = await requireBoostableGig(gigId);
  const boost = await findOrCreatePendingBoost(user.id, gigId);
  await markBoostPaid(boost.id);
  redirect("/panel/ilanlarim?one-cikarildi=1");
}

export async function failMockBoostPayment(gigId: string) {
  const { user } = await requireBoostableGig(gigId);
  const boost = await findOrCreatePendingBoost(user.id, gigId);
  await prisma.gigBoost.update({ where: { id: boost.id }, data: { status: "FAILED" } });
  redirect(`/panel/ilanlarim/${gigId}/one-cikar?hata=odeme-basarisiz`);
}

export async function notifyBoostBankTransferAction(gigId: string) {
  const { user } = await requireBoostableGig(gigId);
  await notifyBoostBankTransfer(user.id, gigId);
}
