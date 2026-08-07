"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gigSchema } from "@/lib/validation";

export type FormState = { error?: string };

export async function updateGigAction(
  gigId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) return { error: "Giriş yapmalısın" };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: { packages: { orderBy: { price: "asc" }, take: 1 } },
  });
  if (!gig || gig.sellerId !== session.user.id) return { error: "Bu ilan sana ait değil" };

  const parsed = gigSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    deliveryDays: formData.get("deliveryDays"),
    revisionCount: formData.get("revisionCount"),
    packageDescription: formData.get("packageDescription"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { title, description, categoryId, price, deliveryDays, revisionCount, packageDescription } =
    parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Geçersiz kategori" };

  const packageId = gig.packages[0]?.id;

  await prisma.gig.update({
    where: { id: gigId },
    data: {
      title,
      description,
      categoryId,
      ...(packageId
        ? {
            packages: {
              update: {
                where: { id: packageId },
                data: { price, deliveryDays, revisionCount, description: packageDescription },
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/panel/ilanlarim");
  redirect("/panel/ilanlarim");
}
