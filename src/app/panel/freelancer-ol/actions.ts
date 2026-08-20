"use server";

import { redirect } from "next/navigation";
import { updateSession } from "@/auth";
import { activeUser, INACTIVE_MESSAGE } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { becomeFreelancerSchema } from "@/lib/validation";

export type FormState = { error?: string };

export async function becomeFreelancerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await activeUser();
  if (!user) return { error: INACTIVE_MESSAGE };
  if (user.role !== "BUYER") return { error: "Bu işlem sadece alıcı hesapları için geçerli" };

  const parsed = becomeFreelancerSchema.safeParse({
    title: formData.get("title"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { title, bio } = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "FREELANCER", title, bio: bio || null },
  });

  await updateSession({ user: { role: "FREELANCER" } });

  redirect("/panel");
}
