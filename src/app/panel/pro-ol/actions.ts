"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { findOrCreatePendingProPurchase, markProPurchasePaid } from "@/lib/pro-purchase";

export async function completeMockProPayment() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol");

  const purchase = await findOrCreatePendingProPurchase(user.id);
  await markProPurchasePaid(purchase.id);

  redirect("/panel");
}

export async function failMockProPayment() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol");

  const purchase = await findOrCreatePendingProPurchase(user.id);
  await prisma.proPurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });

  redirect("/panel/pro-ol?hata=odeme-basarisiz");
}
