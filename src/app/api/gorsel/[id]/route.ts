import { prisma } from "@/lib/prisma";

/** Serves covers held in Postgres. Blob-backed covers are fetched from the CDN directly. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const image = await prisma.uploadedImage.findUnique({
    where: { id },
    select: { mimeType: true, data: true },
  });
  if (!image) return new Response("Bulunamadı", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.data.length),
      // Rows are immutable — a new upload gets a new id — so this can be cached hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
