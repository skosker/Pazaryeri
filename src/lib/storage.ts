import { prisma } from "@/lib/prisma";
import { normalizeCoverImage } from "@/lib/image-processing";

/**
 * Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set, and to Postgres
 * otherwise — the same "configure it or fall back" shape the iyzico and Resend
 * integrations use, so the feature works with nothing but DATABASE_URL.
 */
export function usingBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Downscales the upload, stores it, and returns the URL to render it from. */
export async function putImage(file: File): Promise<string> {
  const { buffer, mimeType, extension } = await normalizeCoverImage(file);

  if (usingBlobStorage()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`kapak/${crypto.randomUUID()}.${extension}`, buffer, {
      access: "public",
      contentType: mimeType,
    });
    return blob.url;
  }

  const image = await prisma.uploadedImage.create({
    data: { mimeType, data: new Uint8Array(buffer), size: buffer.length },
    select: { id: true },
  });
  return `/api/gorsel/${image.id}`;
}

/**
 * Stores an already-prepared image buffer and returns the URL to render it from — the
 * same Blob-or-Postgres split as putImage, but for bytes we produced ourselves (an AI
 * portrait fetched from a generation service) rather than a user's uploaded File.
 */
export async function putImageBuffer(
  buffer: Buffer,
  mimeType: string,
  extension: string,
  prefix = "portre"
): Promise<string> {
  if (usingBlobStorage()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${prefix}/${crypto.randomUUID()}.${extension}`, buffer, {
      access: "public",
      contentType: mimeType,
    });
    return blob.url;
  }

  const image = await prisma.uploadedImage.create({
    data: { mimeType, data: new Uint8Array(buffer), size: buffer.length },
    select: { id: true },
  });
  return `/api/gorsel/${image.id}`;
}

/**
 * Drops a cover that is no longer referenced. Only Postgres-backed rows are
 * removed; Blob objects are left alone so a failed write cannot delete a live file.
 */
export async function deleteImageIfLocal(url: string | null | undefined) {
  const id = url?.startsWith("/api/gorsel/") ? url.slice("/api/gorsel/".length) : null;
  if (!id) return;
  await prisma.uploadedImage.delete({ where: { id } }).catch(() => {
    // Already gone, or never ours — nothing to clean up.
  });
}
