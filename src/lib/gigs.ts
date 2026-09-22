import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const gigCardInclude = {
  seller: { select: { id: true, name: true, title: true, image: true, isOnline: true, isPro: true, emailVerified: true } },
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
  featured: boolean;
  seller: {
    id: string;
    name: string;
    title: string | null;
    image: string | null;
    isOnline: boolean;
    isPro: boolean;
    emailVerified: boolean;
  };
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
    featured: gig.featured,
    seller: { ...gig.seller, emailVerified: Boolean(gig.seller.emailVerified) },
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

export type GigFilters = {
  categorySlugs?: string[];
  subcategorySlugs?: string[];
  q?: string;
  minPrice?: number;
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

/** Just enough to reproduce listGigs' full sort (price, real-photo, real-cover) without
 * pulling every matching gig's description, images, category, packages and reviews over
 * the wire — with ~13k+ gigs in the catalogue, fetching the full payload for every
 * loosely-filtered browse is what was driving the site over its database's monthly data
 * transfer allowance. Only the current page's ids get the full `gigCardInclude` fetch. */
type SortableGig = {
  id: string;
  coverImage: string | null;
  sellerImage: string | null;
  startingPrice: number;
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

  if (filters.minPrice || filters.maxPrice || filters.maxDeliveryDays) {
    const price: Prisma.DecimalFilter = {};
    if (filters.minPrice) price.gte = filters.minPrice;
    if (filters.maxPrice) price.lte = filters.maxPrice;

    where.packages = {
      some: {
        ...(Object.keys(price).length ? { price } : {}),
        ...(filters.maxDeliveryDays
          ? { deliveryDays: { lte: filters.maxDeliveryDays } }
          : {}),
      },
    };
  }

  // "Editör Seçkisi" gigs lead the default feed; every other sort mode (including "yeni")
  // is an explicit choice the buyer made, so it is respected as-is without featured
  // jumping the queue.
  const orderBy: Prisma.GigOrderByWithRelationInput[] =
    filters.sort && filters.sort !== "uygun" ? [{ createdAt: "desc" }] : [{ featured: "desc" }, { createdAt: "desc" }];

  const thin = await prisma.gig.findMany({
    where,
    orderBy,
    select: {
      id: true,
      coverImage: true,
      seller: { select: { image: true } },
      packages: { orderBy: { price: "asc" }, take: 1, select: { price: true } },
    },
  });

  let sortable: SortableGig[] = thin.map((g) => ({
    id: g.id,
    coverImage: g.coverImage,
    sellerImage: g.seller.image,
    startingPrice: g.packages[0] ? Number(g.packages[0].price) : 0,
  }));

  if (filters.sort === "fiyat-artan") {
    sortable = sortable.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (filters.sort === "fiyat-azalan") {
    sortable = sortable.sort((a, b) => b.startingPrice - a.startingPrice);
  }

  // Satıcısı gerçek bir fotoğrafla (Pexels/AI portre/kendi yüklediği) görünenler önce,
  // hâlâ çizilmiş avatarda kalanlar sona. JS'in sort'u kararlı olduğu için (Node/V8),
  // bu ikinci geçiş yukarıdaki sıralamayı (fiyat/tarih) grup içinde bozmadan uygular.
  sortable = sortable.sort((a, b) => {
    const rank = (image: string | null) => (image && !image.startsWith("/api/avatar/") ? 0 : 1);
    return rank(a.sellerImage) - rank(b.sellerImage);
  });

  // Gerçek kapak fotoğrafı olan ilanlar önce, üretilmiş gradyan+ikon kapakta kalanlar en
  // sona — bu üçüncü geçiş de kararlı olduğu için önceki iki sıralamayı grup içinde
  // bozmuyor.
  sortable = sortable.sort((a, b) => (a.coverImage ? 0 : 1) - (b.coverImage ? 0 : 1));

  const total = sortable.length;
  const pageSize = filters.pageSize ?? (total || 1);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);
  const start = (page - 1) * pageSize;
  const pageIds = (filters.pageSize ? sortable.slice(start, start + pageSize) : sortable).map((s) => s.id);

  const fullGigs = await prisma.gig.findMany({
    where: { id: { in: pageIds } },
    include: gigCardInclude,
  });
  const byId = new Map(fullGigs.map((g) => [g.id, g]));
  const cards = pageIds.map((id) => byId.get(id)).filter((g): g is RawGig => Boolean(g)).map(toCardData);

  return { cards, total, page, pageCount };
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

/** How many freelancers list a gig in this category — the category banner's "X
 * freelancer var" strip. */
export async function getCategoryFreelancerCount(categorySlug: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: "FREELANCER",
      suspended: false,
      gigs: { some: { published: true, category: { slug: categorySlug } } },
    },
  });
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
          emailVerified: true,
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
