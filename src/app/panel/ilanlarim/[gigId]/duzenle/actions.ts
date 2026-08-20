"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activeUser, INACTIVE_MESSAGE } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { gigSchema } from "@/lib/validation";
import { readGigForm, packageData, type TierInput } from "@/lib/gig-form";
import { readCoverFromForm } from "@/lib/gig-cover";
import { deleteImageIfLocal } from "@/lib/storage";
import type { PackageTier } from "@/generated/prisma/client";

export type FormState = { error?: string };

export async function updateGigAction(
  gigId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const seller = await activeUser();
  if (!seller) return { error: INACTIVE_MESSAGE };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: { packages: true },
  });
  if (!gig || gig.sellerId !== seller.id) return { error: "Bu ilan sana ait değil" };

  const parsed = gigSchema.safeParse(readGigForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { title, description, categoryId, basic, standard, premium } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Geçersiz kategori" };

  const cover = await readCoverFromForm(formData);
  if (cover.error) return { error: cover.error };

  const tiers: [PackageTier, TierInput][] = [
    ["BASIC", basic],
    ["STANDARD", standard],
    ["PREMIUM", premium],
  ];

  await prisma.$transaction([
    prisma.gig.update({
      where: { id: gigId },
      data: {
        title,
        description,
        categoryId,
        // Left out when the seller did not touch the picker, so the cover survives.
        ...(cover.coverImage !== undefined ? { coverImage: cover.coverImage } : {}),
      },
    }),
    // Update the tier if the gig already has it, otherwise add it. Existing rows are
    // updated in place so orders keep pointing at a valid package.
    ...tiers.map(([tier, values]) => {
      const existing = gig.packages.find((p) => p.tier === tier);
      return existing
        ? prisma.package.update({ where: { id: existing.id }, data: packageData(tier, values) })
        : prisma.package.create({ data: { ...packageData(tier, values), gigId } });
    }),
  ]);

  // The old file is only unreachable once the row above points elsewhere.
  if (cover.coverImage !== undefined && gig.coverImage !== cover.coverImage) {
    await deleteImageIfLocal(gig.coverImage);
  }

  revalidatePath("/panel/ilanlarim");
  redirect("/panel/ilanlarim");
}
