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

const assignableRoles = ["BUYER", "FREELANCER", "ADMIN"] as const;

export async function changeUserRoleAction(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;

  const role = formData.get("role");
  if (typeof role !== "string" || !assignableRoles.includes(role as (typeof assignableRoles)[number])) {
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({ where: { id: userId }, data: { role: role as (typeof assignableRoles)[number] } });
  revalidatePath("/admin/kullanicilar");
}
