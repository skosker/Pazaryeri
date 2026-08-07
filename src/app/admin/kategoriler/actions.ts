"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export type FormState = { error?: string };

function slugify(name: string) {
  return name
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

export async function createCategoryAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "sparkles").trim();
  if (!name) return { error: "Kategori adı gerekli" };

  const slug = slugify(name);
  if (!slug) return { error: "Geçerli bir kategori adı gir" };

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) return { error: "Bu isimde bir kategori zaten var" };

  await prisma.category.create({ data: { name, slug, icon } });
  revalidatePath("/admin/kategoriler");
  return {};
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "sparkles").trim();
  if (!name) return;

  await prisma.category.update({ where: { id: categoryId }, data: { name, icon } });
  revalidatePath("/admin/kategoriler");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();

  const gigCount = await prisma.gig.count({ where: { categoryId } });
  if (gigCount > 0) return; // has gigs — can't delete

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/kategoriler");
}
