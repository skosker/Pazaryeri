"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function togglePublishedAction(gigId: string) {
  await requireAdmin();

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig) return;

  await prisma.gig.update({ where: { id: gigId }, data: { published: !gig.published } });
  revalidatePath("/admin/ilanlar");
}

export async function deleteGigAction(gigId: string) {
  await requireAdmin();

  const orderCount = await prisma.order.count({ where: { gigId } });
  if (orderCount > 0) return; // has order history — unpublish instead of delete

  await prisma.gig.delete({ where: { id: gigId } });
  revalidatePath("/admin/ilanlar");
}
