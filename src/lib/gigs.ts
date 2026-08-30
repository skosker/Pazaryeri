import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const gigCardInclude = {
  seller: { select: { id: true, name: true, image: true, isOnline: true, isPro: true } },
  category: { select: { name: true, slug: true, icon: true } },
  subcategory: { select: { name: true, slug: true } },
  packages: { orderBy: { price: "asc" as const }, take: 1 },
  reviews: { select: { rating: true } },
} satisfies Prisma.GigInclude;

type RawGig = Prisma.GigGetPayload<{ include: typeof gigCardInclude }>;

export type GigCardData = {
  slug: string;
  title: string;
  coverColor: string;
  coverImage: string | null;
  seller: { id: string; name: string; image: string | null; isOnline: boolean; isPro: boolean };
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  subcategoryName: string | null;
  subcategorySlug: string | null;
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
    coverImage: gig.coverImage,
    seller: gig.seller,
    categoryName: gig.category.name,
    categorySlug: gig.category.slug,
    categoryIcon: gig.category.icon,
    subcategoryName: gig.subcategory?.name ?? null,
    subcategorySlug: gig.subcategory?.slug ?? null,
    startingPrice: gig.packages[0] ? Number(gig.packages[0].price) : 0,
    rating,
    reviewCount,
  };
}

export async function getFeaturedGigs(limit = 6): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    where: { published: true },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return gigs.map(toCardData);
}

/** 0 for a seller with a real photo, 1 for a drawn avatar (or none) — sorts real photos first. */
function photoRank(card: GigCardData): number {
  const image = card.seller.image;
  return image && !image.startsWith("/api/avatar/") ? 0 : 1;
}

export type GigFilters = {
  categorySlugs?: string[];
  subcategorySlugs?: string[];
  q?: string;
  maxPrice?: number;
  maxDeliveryDays?: number;
  onlineSellersOnly?: boolean;
  proSellersOnly?: boolean;
  sort?: "uygun" | "fiyat-artan" | "fiyat-azalan" | "yeni";
  page?: number;
  pageSize?: number;
};

export type GigListResult = {
  cards: GigCardData[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listGigs(filters: GigFilters): Promise<GigListResult> {
  const where: Prisma.GigWhereInput = { published: true };

  if (filters.categorySlugs?.length) {
    where.category = { slug: { in: filters.categorySlugs } };
  }

  if (filters.subcategorySlugs?.length) {
    where.subcategory = { slug: { in: filters.subcategorySlugs } };
  }

  if (filters.onlineSellersOnly || filters.proSellersOnly) {
    where.seller = {
      ...(filters.onlineSellersOnly ? { isOnline: true } : {}),
      ...(filters.proSellersOnly ? { isPro: true } : {}),
    };
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

  // Satıcısı gerçek bir fotoğrafla (Pexels/AI portre/kendi yüklediği) görünenler önce,
  // hâlâ çizilmiş avatarda kalanlar sona. JS'in sort'u kararlı olduğu için (Node/V8),
  // bu ikinci geçiş yukarıdaki sıralamayı (fiyat/tarih) grup içinde bozmadan uygular.
  cards = cards.sort((a, b) => photoRank(a) - photoRank(b));

  const total = cards.length;
  const pageSize = filters.pageSize ?? (total || 1);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);
  const start = (page - 1) * pageSize;
  const paged = filters.pageSize ? cards.slice(start, start + pageSize) : cards;

  return { cards: paged, total, page, pageCount };
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
      published: true,
    },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return gigs.map(toCardData);
}

export async function getGigsBySeller(sellerId: string): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    where: { sellerId, published: true },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
  });
  return gigs.map(toCardData);
}

export type CategoryFreelancerSummary = {
  total: number;
  sample: { id: string; name: string; image: string | null }[];
};

/** How many freelancers list a gig in this category, plus a handful of them for an
 * avatar row — the category banner's "X freelancer var" strip. */
export async function getCategoryFreelancerSummary(categorySlug: string): Promise<CategoryFreelancerSummary> {
  const where = {
    role: "FREELANCER" as const,
    suspended: false,
    gigs: { some: { published: true, category: { slug: categorySlug } } },
  };

  const [total, sample] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, name: true, image: true },
      orderBy: [{ isOnline: "desc" }, { name: "asc" }],
      take: 4,
    }),
  ]);

  return { total, sample };
}

export async function getGigBySlug(slug: string) {
  const gig = await prisma.gig.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          title: true,
          bio: true,
          image: true,
          skills: true,
          createdAt: true,
          isOnline: true,
          isPro: true,
        },
      },
      category: { select: { name: true, slug: true, icon: true } },
      subcategory: { select: { name: true, slug: true } },
      packages: { orderBy: { price: "asc" } },
      reviews: {
        include: { buyer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return gig;
}
