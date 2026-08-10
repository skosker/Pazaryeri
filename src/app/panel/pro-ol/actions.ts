"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function becomeProBuyerAction() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol");
  if (session.user.role !== "BUYER") redirect("/panel");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isPro: true },
  });

  redirect("/panel");
}
