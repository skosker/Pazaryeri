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

export async function toggleProFreelancerAction(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "FREELANCER") return;

  await prisma.user.update({ where: { id: userId }, data: { isPro: !user.isPro } });
  revalidatePath("/admin/kullanicilar");
}

/**
 * Deletes a user for good. Every row that points at them is set to cascade in the schema,
 * so this also removes their gigs, the orders and reviews on those gigs, the orders they
 * placed, their payouts and their tokens — the whole account, not a soft flag. Suspension
 * (toggleSuspensionAction) is the reversible option; this one is not.
 *
 * An admin cannot delete their own row, matching the rest of this screen — that would
 * end their session mid-action and could remove the last admin.
 */
export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return { ok: false as const, error: "Kendi hesabını silemezsin" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "Kullanıcı bulunamadı" };

  try {
    await prisma.$transaction(async (tx) => {
      // Most relations cascade from the user row, but Order.gigId does not: an order placed
      // on this seller's gig blocks the gig's (cascaded) deletion. So the orders on their
      // gigs are removed first — that cascade takes the payments, reviews and payouts on
      // those orders with them — and only then does deleting the user cascade the gigs.
      const gigs = await tx.gig.findMany({ where: { sellerId: userId }, select: { id: true } });
      const gigIds = gigs.map((gig) => gig.id);
      if (gigIds.length > 0) {
        await tx.order.deleteMany({ where: { gigId: { in: gigIds } } });
      }
      await tx.user.delete({ where: { id: userId } });
    });
  } catch {
    return { ok: false as const, error: "Kullanıcı silinemedi. Askıya almayı deneyebilirsin." };
  }

  revalidatePath("/admin/kullanicilar");
  return { ok: true as const };
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
