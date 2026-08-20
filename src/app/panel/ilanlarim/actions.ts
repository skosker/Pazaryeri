"use server";

import { revalidatePath } from "next/cache";
import { activeUser, INACTIVE_MESSAGE } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";

async function requireGigOwner(gigId: string) {
  const seller = await activeUser();
  if (!seller) throw new Error(INACTIVE_MESSAGE);

  const gig = await prisma.gig.findUnique({ where: { id: gigId } });
  if (!gig || gig.sellerId !== seller.id) throw new Error("Bu ilan sana ait değil");

  return gig;
}

export async function toggleMyGigPublishedAction(gigId: string) {
  const gig = await requireGigOwner(gigId);
  await prisma.gig.update({ where: { id: gigId }, data: { published: !gig.published } });
  revalidatePath("/panel/ilanlarim");
}

export async function deleteMyGigAction(gigId: string) {
  await requireGigOwner(gigId);

  const orderCount = await prisma.order.count({ where: { gigId } });
  if (orderCount > 0) return; // has order history — pause instead of delete

  await prisma.gig.delete({ where: { id: gigId } });
  revalidatePath("/panel/ilanlarim");
}
