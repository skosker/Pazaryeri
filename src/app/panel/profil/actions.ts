"use server";

import { revalidatePath } from "next/cache";
import { activeUser, INACTIVE_MESSAGE } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import { validateImage } from "@/lib/image-constraints";
import { normalizeCoverImage } from "@/lib/image-processing";
import { putImageBuffer } from "@/lib/storage";
import { moderateProfilePhoto } from "@/lib/photo-moderation";

export type FormState = { error?: string; success?: boolean; flagged?: boolean };

export async function updateProfileAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await activeUser();
  if (!user) return { error: INACTIVE_MESSAGE };

  // The form only draws Unvan and Hakkımda for freelancers, so for a buyer these come
  // back as null rather than missing — and null is not what `.optional()` accepts, which
  // made every buyer's save fail on "Invalid input" before it ever reached the database.
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") ?? undefined,
    bio: formData.get("bio") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  const { name, title, bio } = parsed.data;

  let flagged = false;
  let photoData: { image?: string; pendingImage?: string | null; photoFlagReason?: string | null } = {};

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const invalid = validateImage(photo, "Profil fotoğrafı");
    if (invalid) return { error: invalid.error };

    const { buffer, mimeType, extension } = await normalizeCoverImage(photo);
    const result = await moderateProfilePhoto(buffer, mimeType);

    const url = await putImageBuffer(buffer, mimeType, extension, "profil");

    if (result.checked && result.flagged) {
      flagged = true;
      photoData = { pendingImage: url, photoFlagReason: result.reason ?? "Otomatik denetim tarafından işaretlendi" };
    } else {
      photoData = { image: url, pendingImage: null, photoFlagReason: null };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      ...(user.role === "FREELANCER" ? { title: title || null, bio: bio || null } : {}),
      ...photoData,
    },
  });

  revalidatePath("/panel");
  revalidatePath("/panel/profil");
  return { success: true, flagged };
}
