"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";

export async function becomeProBuyerAction() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol");
  if (user.role !== "BUYER") redirect("/panel");

  await prisma.user.update({
    where: { id: user.id },
    data: { isPro: true },
  });

  redirect("/panel");
}
