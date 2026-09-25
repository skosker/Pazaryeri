"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

/** Takes a request down (spam, contact details, off-platform deals); its pending offers close with it. */
export async function removeJobRequestAction(requestId: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.jobRequest.update({ where: { id: requestId }, data: { status: "REMOVED" } }),
    prisma.jobOffer.updateMany({ where: { requestId, status: "PENDING" }, data: { status: "DECLINED" } }),
  ]);
  revalidatePath("/admin/is-talepleri");
  revalidatePath("/is-talepleri");
  revalidatePath(`/is-talepleri/${requestId}`);
}
