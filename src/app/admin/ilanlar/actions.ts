"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { grantFounderIfEligible } from "@/lib/founders";

export async function approveGigAction(gigId: string) {
  await requireAdmin();
  const gig = await prisma.gig.update({
    where: { id: gigId },
    data: { status: "APPROVED", published: true },
    select: { sellerId: true },
  });
  await grantFounderIfEligible(gig.sellerId);
  revalidatePath("/admin/ilanlar");
}

export async function rejectGigAction(gigId: string) {
  await requireAdmin();
  await prisma.gig.update({ where: { id: gigId }, data: { status: "REJECTED", published: false } });
  revalidatePath("/admin/ilanlar");
}

export async function toggleFeaturedAction(gigId: string) {
  await requireAdmin();

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig) return;

  await prisma.gig.update({ where: { id: gigId }, data: { featured: !gig.featured } });
  revalidatePath("/admin/ilanlar");
}

export async function togglePublishedAction(gigId: string) {
  await requireAdmin();

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig) return;

  await prisma.gig.update({ where: { id: gigId }, data: { published: !gig.published } });
  if (!gig.published) await grantFounderIfEligible(gig.sellerId);
  revalidatePath("/admin/ilanlar");
}

export async function deleteGigAction(gigId: string) {
  await requireAdmin();

  const orderCount = await prisma.order.count({ where: { gigId } });
  if (orderCount > 0) return; // has order history — unpublish instead of delete

  await prisma.gig.delete({ where: { id: gigId } });
  revalidatePath("/admin/ilanlar");
}
