import sharp from "sharp";

/** Covers never render wider than the gig detail hero, so anything larger is wasted bytes. */
const MAX_COVER_WIDTH = 1600;
const MAX_COVER_HEIGHT = 1200;
const WEBP_QUALITY = 82;

export type NormalizedImage = { buffer: Buffer; mimeType: string; extension: string };

/**
 * Downscales an upload and re-encodes it as WebP before it reaches the store.
 * A 4MB phone photo becomes a couple of hundred KB, which matters most on the
 * Postgres path where the bytes sit in the database and stream through the app.
 *
 * Falls back to the original bytes if sharp cannot handle the file, so a decode
 * failure costs size rather than the whole upload.
 */
export async function normalizeCoverImage(file: File): Promise<NormalizedImage> {
  const original = Buffer.from(await file.arrayBuffer());

  try {
    const buffer = await sharp(original)
      .rotate() // honour EXIF orientation before it is stripped
      .resize({
        width: MAX_COVER_WIDTH,
        height: MAX_COVER_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Re-encoding tiny images can grow them; keep whichever is smaller.
    if (buffer.length >= original.length) {
      return { buffer: original, mimeType: file.type, extension: extensionFor(file.type) };
    }

    return { buffer, mimeType: "image/webp", extension: "webp" };
  } catch {
    return { buffer: original, mimeType: file.type, extension: extensionFor(file.type) };
  }
}

function extensionFor(mimeType: string) {
  return mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
}
