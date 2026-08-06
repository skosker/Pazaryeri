import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const gigCardInclude = {
  seller: { select: { id: true, name: true } },
  category: { select: { name: true, slug: true } },
  packages: { orderBy: { price: "asc" as const }, take: 1 },
  reviews: { select: { rating: true } },
} satisfies Prisma.GigInclude;

type RawGig = Prisma.GigGetPayload<{ include: typeof gigCardInclude }>;

export type GigCardData = {
  slug: string;
  title: string;
  coverColor: string;
  seller: { id: string; name: string };
  categoryName: string;
  startingPrice: number;
  rating: number | null;
  reviewCount: number;
};

function toCardData(gig: RawGig): GigCardData {
  const reviewCount = gig.reviews.length;
  const rating =
    reviewCount > 0
      ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  return {
    slug: gig.slug,
    title: gig.title,
    coverColor: gig.coverColor,
    seller: gig.seller,
    categoryName: gig.category.name,
    startingPrice: gig.packages[0] ? Number(gig.packages[0].price) : 0,
    rating,
    reviewCount,
  };
}

export async function getFeaturedGigs(limit = 6): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return gigs.map(toCardData);
}

export type GigFilters = {
  categorySlugs?: string[];
  q?: string;
  maxPrice?: number;
  maxDeliveryDays?: number;
  sort?: "uygun" | "fiyat-artan" | "fiyat-azalan" | "yeni";
};

export async function listGigs(filters: GigFilters): Promise<GigCardData[]> {
  const where: Prisma.GigWhereInput = {};

  if (filters.categorySlugs?.length) {
    where.category = { slug: { in: filters.categorySlugs } };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.maxPrice || filters.maxDeliveryDays) {
    where.packages = {
      some: {
        ...(filters.maxPrice ? { price: { lte: filters.maxPrice } } : {}),
        ...(filters.maxDeliveryDays
          ? { deliveryDays: { lte: filters.maxDeliveryDays } }
          : {}),
      },
    };
  }

  const orderBy: Prisma.GigOrderByWithRelationInput =
    filters.sort === "yeni" ? { createdAt: "desc" } : { createdAt: "desc" };

  const gigs = await prisma.gig.findMany({
    where,
    include: gigCardInclude,
    orderBy,
  });

  let cards = gigs.map(toCardData);

  if (filters.sort === "fiyat-artan") {
    cards = cards.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (filters.sort === "fiyat-azalan") {
    cards = cards.sort((a, b) => b.startingPrice - a.startingPrice);
  }

  return cards;
}

export async function getRelatedGigs(
  categorySlug: string,
  excludeSlug: string,
  limit = 3
): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    where: {
      category: { slug: categorySlug },
      slug: { not: excludeSlug },
    },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return gigs.map(toCardData);
}

export async function getGigBySlug(slug: string) {
  const gig = await prisma.gig.findUnique({
    where: { slug },
    include: {
      seller: { select: { id: true, name: true, title: true, bio: true, createdAt: true } },
      category: { select: { name: true, slug: true } },
      packages: { orderBy: { price: "asc" } },
      reviews: {
        include: { buyer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return gig;
}
