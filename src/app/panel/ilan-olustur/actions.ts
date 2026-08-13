"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gigSchema } from "@/lib/validation";
import { readGigForm, packageData } from "@/lib/gig-form";

export type FormState = { error?: string };

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createGigAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "FREELANCER") {
    return { error: "Sadece freelancer hesapları ilan oluşturabilir" };
  }

  const parsed = gigSchema.safeParse(readGigForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { title, description, categoryId, basic, standard, premium } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Geçersiz kategori" };

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.gig.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const gig = await prisma.gig.create({
    data: {
      slug,
      title,
      description,
      categoryId,
      sellerId: session.user.id,
      packages: {
        create: [
          packageData("BASIC", basic),
          packageData("STANDARD", standard),
          packageData("PREMIUM", premium),
        ],
      },
    },
  });

  redirect(`/gig/${gig.slug}`);
}
