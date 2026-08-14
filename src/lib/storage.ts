import { prisma } from "@/lib/prisma";

/**
 * Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set, and to Postgres
 * otherwise — the same "configure it or fall back" shape the iyzico and Resend
 * integrations use, so the feature works with nothing but DATABASE_URL.
 */
export function usingBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Stores the file and returns the URL to render it from. */
export async function putImage(file: File): Promise<string> {
  if (usingBlobStorage()) {
    const { put } = await import("@vercel/blob");
    const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const blob = await put(`kapak/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const image = await prisma.uploadedImage.create({
    data: {
      mimeType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
      size: file.size,
    },
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
