"use server";

import { requireAdmin } from "@/lib/require-admin";
import {
  assignProfilePhotos,
  profilePhotoProgress,
  resetProfilePhotos,
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
