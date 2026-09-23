"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { assertMockPaymentAllowed } from "@/lib/paytr";
import {
  findOrCreatePendingProPurchase,
  markProPurchasePaid,
  notifyProBankTransfer,
} from "@/lib/pro-purchase";

export async function completeMockProPayment() {
  assertMockPaymentAllowed();
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol/odeme");

  const purchase = await findOrCreatePendingProPurchase(user.id);
  await markProPurchasePaid(purchase.id);

  redirect("/panel");
}

export async function failMockProPayment() {
  assertMockPaymentAllowed();
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol/odeme");

  const purchase = await findOrCreatePendingProPurchase(user.id);
  await prisma.proPurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });

  redirect("/panel/pro-ol/odeme?hata=odeme-basarisiz");
}

export async function notifyProBankTransferAction() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol/odeme");

  await notifyProBankTransfer(user.id);
}
