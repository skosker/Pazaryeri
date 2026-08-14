/**
 * Shared by the upload form and the server-side store. Kept free of server
 * imports so the client bundle does not pull Prisma in behind these constants.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const readableTypes = "JPG, PNG veya WebP";

/** Rejects anything the store should not accept. Returns null when the file is fine. */
export function validateImage(file: File): { error: string } | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { error: `Kapak görseli ${readableTypes} biçiminde olmalı` };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `Kapak görseli en fazla ${MAX_IMAGE_BYTES / 1024 / 1024} MB olabilir` };
  }
  return null;
}
