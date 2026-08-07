"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function toggleSuspensionAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({ where: { id: userId }, data: { suspended: !user.suspended } });
  revalidatePath("/admin/kullanicilar");
}

export async function toggleAdminAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: user.role === "ADMIN" ? "BUYER" : "ADMIN" },
  });
  revalidatePath("/admin/kullanicilar");
}
