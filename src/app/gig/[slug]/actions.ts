"use server";

import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { createOrder, OrderError } from "@/lib/orders";

export async function orderAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const packageId = String(formData.get("packageId") ?? "");

  const buyer = await activeUser();
  if (!buyer) {
    redirect(`/giris?callbackUrl=/gig/${slug}`);
  }

  // The package id arrives from the client, so confirm it really belongs to this gig
  // before turning it into an order.
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { gig: { select: { slug: true } } },
  });
  if (!pkg || pkg.gig.slug !== slug) {
    redirect(`/gig/${slug}?hata=${encodeURIComponent("Geçersiz paket seçimi")}`);
  }

  try {
    const order = await createOrder(buyer.id, packageId);
    redirect(`/odeme/${order.id}`);
  } catch (error) {
    if (error instanceof OrderError) {
      redirect(`/gig/${slug}?hata=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}
