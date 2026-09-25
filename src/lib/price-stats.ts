import { prisma } from "@/lib/prisma";

export type CategoryPriceStat = {
  categoryId: string;
  categoryName: string;
  gigCount: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
};

/**
 * Each published listing's starting price (its cheapest package — the same figure the
 * ilanlar table already shows), grouped by category, for comparing how categories are
 * priced against each other. Generated showcase listings are included on purpose here:
 * there is only a handful of real ones so far, nowhere near enough to compare categories
 * against each other meaningfully on their own.
 */
export async function getCategoryPriceComparison(): Promise<CategoryPriceStat[]> {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  const gigs = await prisma.gig.findMany({
    where: { published: true },
    select: {
      categoryId: true,
      packages: { where: { tier: { not: "CUSTOM" as const } }, orderBy: { price: "asc" }, take: 1, select: { price: true } },
    },
  });

  const pricesByCategory = new Map<string, number[]>();
  for (const gig of gigs) {
    const price = gig.packages[0]?.price;
    if (price === undefined) continue;
    const list = pricesByCategory.get(gig.categoryId);
    if (list) list.push(Number(price));
    else pricesByCategory.set(gig.categoryId, [Number(price)]);
  }

  return categories
    .map((category): CategoryPriceStat | null => {
      const prices = pricesByCategory.get(category.id);
      if (!prices || prices.length === 0) return null;
      return {
        categoryId: category.id,
        categoryName: category.name,
        gigCount: prices.length,
        minPrice: Math.min(...prices),
        avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        maxPrice: Math.max(...prices),
      };
    })
    .filter((row): row is CategoryPriceStat => row !== null)
    .sort((a, b) => b.avgPrice - a.avgPrice);
}
