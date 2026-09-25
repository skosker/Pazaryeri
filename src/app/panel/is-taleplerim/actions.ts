"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import { sendJobOfferAcceptedEmail } from "@/lib/email";
import { JobRequestError, acceptOffer, closeJobRequest, createJobRequest } from "@/lib/job-requests";

export type RequestFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["title", "categoryId", "budgetMin", "budgetMax", "deliveryDays", "description"];

export async function createRequestAction(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const values = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/is-taleplerim/yeni");

  let id: string;
  try {
    const request = await createJobRequest(user.id, {
      title: values.title.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId,
      budgetMin: Number(values.budgetMin.replace(/\./g, "")),
      budgetMax: Number(values.budgetMax.replace(/\./g, "")),
      deliveryDays: Number(values.deliveryDays),
    });
    id = request.id;
  } catch (error) {
    if (error instanceof JobRequestError) return { error: error.message, values };
    throw error;
  }
  revalidatePath("/is-talepleri");
  redirect(`/panel/is-taleplerim/${id}?yeni=1`);
}

export async function closeRequestAction(requestId: string) {
  const user = await activeUser();
  if (!user) return;
  await closeJobRequest(user.id, requestId);
  revalidatePath(`/panel/is-taleplerim/${requestId}`);
  revalidatePath("/is-talepleri");
}

export async function acceptOfferAction(requestId: string, offerId: string) {
  const user = await activeUser();
  if (!user) redirect(`/giris?callbackUrl=/panel/is-taleplerim/${requestId}`);

  let orderId: string;
  try {
    orderId = await acceptOffer(user.id, offerId);
  } catch (error) {
    if (error instanceof JobRequestError) {
      redirect(`/panel/is-taleplerim/${requestId}?hata=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  const offer = await prisma.jobOffer.findUnique({
    where: { id: offerId },
    select: { price: true, seller: { select: { email: true, name: true } }, request: { select: { title: true } } },
  });
  if (offer) {
    await sendJobOfferAcceptedEmail({
      to: offer.seller.email,
      name: offer.seller.name,
      requestTitle: offer.request.title,
      price: Number(offer.price),
      orderUrl: `${siteUrl}/siparis/${orderId}`,
    });
  }
  revalidatePath("/is-talepleri");
  redirect(`/odeme/${orderId}`);
}
