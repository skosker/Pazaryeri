"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gigSchema } from "@/lib/validation";
import { readGigForm, packageData, type TierInput } from "@/lib/gig-form";
import type { PackageTier } from "@/generated/prisma/client";

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
    include: { packages: true },
  });
  if (!gig || gig.sellerId !== session.user.id) return { error: "Bu ilan sana ait değil" };

  const parsed = gigSchema.safeParse(readGigForm(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { title, description, categoryId, basic, standard, premium } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Geçersiz kategori" };

  const tiers: [PackageTier, TierInput][] = [
    ["BASIC", basic],
    ["STANDARD", standard],
    ["PREMIUM", premium],
  ];

  await prisma.$transaction([
    prisma.gig.update({
      where: { id: gigId },
      data: { title, description, categoryId },
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

  revalidatePath("/panel/ilanlarim");
  redirect("/panel/ilanlarim");
}
