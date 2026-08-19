"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { assignCoverPhotos, coverPhotoProgress, type CoverPhotoBatch } from "@/lib/cover-photos";

// Every export in a "use server" module is reachable as its own endpoint, so each one
// authorises itself.

export type BatchResult =
  | { ok: true; batch: CoverPhotoBatch }
  | { ok: false; error: string };

/**
 * One slice of the photo run. The page calls this repeatedly while listings remain, so
 * no single request has to walk the whole catalogue.
 */
export async function runCoverPhotoBatch(force: boolean): Promise<BatchResult> {
  await requireAdmin();

  try {
    const batch = await assignCoverPhotos({ force, maxQueries: 10 });
    revalidatePath("/kategoriler");
    revalidatePath("/admin/kapaklar");
    return { ok: true, batch };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Beklenmeyen bir hata oldu" };
  }
}

export async function readCoverPhotoProgress() {
  await requireAdmin();
  return coverPhotoProgress();
}
