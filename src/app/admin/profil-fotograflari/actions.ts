"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  assignProfilePhotos,
  profilePhotoProgress,
  resetProfilePhotos,
  revertProfilePhoto,
  revertDuplicatePhotos,
  revertProfilePhotosByName,
  type ProfilePhotoBatch,
} from "@/lib/profile-photos";

// Every export in a "use server" module is reachable as its own endpoint, so each one
// authorises itself.

export type ProfilePhotoBatchResult =
  | { ok: true; batch: ProfilePhotoBatch }
  | { ok: false; error: string };

/**
 * One slice of the photo run. The page calls this repeatedly, passing back the query it
 * left off at, so no single request has to walk every search.
 */
export async function runProfilePhotoBatch(
  force: boolean,
  startQuery: number
): Promise<ProfilePhotoBatchResult> {
  await requireAdmin();

  try {
    const batch = await assignProfilePhotos({ force, startQuery, maxQueries: 4 });
    return { ok: true, batch };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Beklenmeyen bir hata oldu",
    };
  }
}

export async function readProfilePhotoProgress() {
  await requireAdmin();
  return profilePhotoProgress();
}

/**
 * Drops one profile's photo to its drawn avatar — the reviewer clicked "Avatara döndür" on
 * a face that did not fit. The gallery page is rebuilt so the card disappears from it.
 */
export async function revertOneProfilePhotoAction(id: string) {
  await requireAdmin();
  await revertProfilePhoto(id);
  revalidatePath("/admin/profil-fotograflari/incele");
}

/**
 * Bulk-fixes every exact photo duplicate in one go — the "these two are the same photo"
 * cases the reviewer keeps finding by eye.
 */
export async function revertDuplicatePhotosAction() {
  await requireAdmin();
  const { reverted } = await revertDuplicatePhotos();
  revalidatePath("/admin/profil-fotograflari/incele");
  return { reverted };
}

/**
 * Reverts every profile named in the pasted list — for a reviewer who spots several bad
 * faces while scanning and wants to clear them in one action instead of one click each.
 */
export async function revertProfilePhotosByNameAction(namesText: string) {
  await requireAdmin();
  const names = namesText
    .split(/[,\n]/)
    .map((name) => name.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  const { reverted } = await revertProfilePhotosByName(names);
  revalidatePath("/admin/profil-fotograflari/incele");
  return { reverted };
}

/**
 * The way back: drops the fetched photographs and puts the drawn avatars on again. The
 * photo run can be repeated afterwards, so nothing here is one-way.
 */
export async function resetProfilePhotosAction() {
  await requireAdmin();

  try {
    const { reset } = await resetProfilePhotos();
    return { ok: true as const, reset, progress: await profilePhotoProgress() };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Beklenmeyen bir hata oldu",
    };
  }
}
