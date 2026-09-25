"use server";

import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import { sendNewJobOfferEmail } from "@/lib/email";
import { JobRequestError, saveOffer, withdrawOffer } from "@/lib/job-requests";

export type OfferFormState = { error?: string; saved?: boolean; values?: Record<string, string> };

export async function saveOfferAction(requestId: string, _prev: OfferFormState, formData: FormData): Promise<OfferFormState> {
  const values = Object.fromEntries(["gigId", "price", "deliveryDays", "message"].map((k) => [k, String(formData.get(k) ?? "")]));
  const user = await activeUser();
  if (!user) return { error: "Teklif vermek için giriş yap.", values };
  if (user.role !== "FREELANCER") return { error: "Teklifi freelancer hesabıyla verebilirsin.", values };

  try {
    const { offer, isNew } = await saveOffer(user.id, requestId, {
      gigId: values.gigId,
      price: Number(values.price.replace(",", ".")),
      deliveryDays: Number(values.deliveryDays),
      message: values.message.trim(),
    });
    if (isNew) {
      const request = await prisma.jobRequest.findUnique({
        where: { id: requestId },
        select: { title: true, buyer: { select: { email: true, name: true } } },
      });
      if (request) {
        await sendNewJobOfferEmail({
          to: request.buyer.email,
          name: request.buyer.name,
          requestTitle: request.title,
          sellerName: user.name,
          price: Number(offer.price),
          deliveryDays: offer.deliveryDays,
          manageUrl: `${siteUrl}/panel/is-taleplerim/${requestId}`,
        });
      }
    }
  } catch (error) {
    if (error instanceof JobRequestError) return { error: error.message, values };
    throw error;
  }
  revalidatePath(`/is-talepleri/${requestId}`);
  revalidatePath("/is-talepleri");
  return { saved: true, values };
}

export async function withdrawOfferAction(requestId: string, offerId: string) {
  const user = await activeUser();
  if (!user) return;
  await withdrawOffer(user.id, offerId);
  revalidatePath(`/is-talepleri/${requestId}`);
  revalidatePath("/panel/tekliflerim");
}
