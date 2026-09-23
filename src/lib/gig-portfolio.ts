import { putImage } from "@/lib/storage";
import { validateImage, MAX_PORTFOLIO_IMAGES, portfolioLimit } from "@/lib/image-constraints";
import { prisma } from "@/lib/prisma";

/** How many "örnek işler" images this seller may keep on a gig (Pro gets more). */
export async function sellerPortfolioLimit(sellerId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: sellerId }, select: { isPro: true } });
  return portfolioLimit(Boolean(user?.isPro));
}

/**
 * Reads the "örnek işler" picker out of a gig form. Existing images the seller marked
 * for removal arrive as a comma-joined list in `removedPortfolio` (URLs never contain
 * commas); anything newly picked is uploaded and appended to what is left.
 *
 * Returns `portfolioImages: undefined` when nothing changed, the same three-state shape
 * `readCoverFromForm` uses, so an edit that only touches the price leaves the gallery
 * alone instead of wiping it.
 */
export async function readPortfolioFromForm(
  formData: FormData,
  existingUrls: string[],
  maxImages: number = MAX_PORTFOLIO_IMAGES
): Promise<{ portfolioImages?: string[]; error?: string }> {
  const removed = new Set(
    String(formData.get("removedPortfolio") ?? "")
      .split(",")
      .filter(Boolean)
  );
  const kept = existingUrls.filter((url) => !removed.has(url));

  const files = formData
    .getAll("portfolio")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (removed.size === 0 && files.length === 0) return {};

  if (kept.length + files.length > maxImages) {
    return { error: `En fazla ${maxImages} örnek iş görseli ekleyebilirsin` };
  }

  const uploaded: string[] = [];
  for (const file of files) {
    const invalid = validateImage(file, "Örnek iş görseli");
    if (invalid) return { error: invalid.error };
    uploaded.push(await putImage(file));
  }

  return { portfolioImages: [...kept, ...uploaded] };
}
