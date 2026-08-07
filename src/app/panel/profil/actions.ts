"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";

export type FormState = { error?: string; success?: boolean };

export async function updateProfileAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user) return { error: "Giriş yapmalısın" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { name, title, bio } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      ...(session.user.role === "FREELANCER" ? { title: title || null, bio: bio || null } : {}),
    },
  });

  revalidatePath("/panel");
  revalidatePath("/panel/profil");
  return { success: true };
}
