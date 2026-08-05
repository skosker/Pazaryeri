"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";
import {
  sellerStartOrder,
  sellerDeliverOrder,
  buyerCompleteOrder,
  OrderActionError,
} from "@/lib/order-actions";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  return session.user;
}

export async function startOrderAction(orderId: string) {
  const user = await requireUser();
  try {
    await sellerStartOrder(orderId, user.id);
  } catch (error) {
    if (!(error instanceof OrderActionError)) throw error;
  }
  revalidatePath(`/siparis/${orderId}`);
}

export async function deliverOrderAction(orderId: string) {
  const user = await requireUser();
  try {
    await sellerDeliverOrder(orderId, user.id);
  } catch (error) {
    if (!(error instanceof OrderActionError)) throw error;
  }
  revalidatePath(`/siparis/${orderId}`);
}

export async function completeOrderAction(orderId: string) {
  const user = await requireUser();
  try {
    await buyerCompleteOrder(orderId, user.id);
  } catch (error) {
    if (!(error instanceof OrderActionError)) throw error;
  }
  revalidatePath(`/siparis/${orderId}`);
}

export type ReviewFormState = { error?: string };

export async function submitReviewAction(
  orderId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== user.id) return { error: "Yetkisiz işlem" };
  if (order.status !== "COMPLETED") return { error: "Sipariş henüz tamamlanmadı" };

  await prisma.review.create({
    data: {
      orderId,
      gigId: order.gigId,
      buyerId: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath(`/siparis/${orderId}`);
  return {};
}
