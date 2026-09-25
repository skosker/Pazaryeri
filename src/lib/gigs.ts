import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { isSponsored } from "@/lib/gig-boost";
import { activeCampaignPercent, campaignPrice, getCampaignPricing, type CampaignPricing } from "@/lib/campaign";
import { membershipSelect, membershipTier, proMemberWhere } from "@/lib/membership";

const gigCardInclude = {
  seller: {
    select: { id: true, name: true, title: true, image: true, isOnline: true, ...membershipSelect, emailVerified: true, founderNumber: true },
  },
  category: { select: { name: true, slug: true, icon: true } },
  subcategory: { select: { name: true, slug: true } },
  packages: { where: { tier: { not: "CUSTOM" as const } }, orderBy: { price: "asc" as const }, take: 1 },
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
    isProPlus: boolean;
    emailVerified: boolean;
    isFounder: boolean;
  };
  sponsored: boolean;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  startingPrice: number;
  rating: number | null;
  reviewCount: number;
  /** Set only while a seasonal campaign is live and this gig joined it. */
  campaign: { name: string; percent: number; listPrice: number } | null;
};

function toCardData(gig: RawGig, pricing: CampaignPricing): GigCardData {
  const tier = membershipTier(gig.seller);
  const listPrice = gig.packages[0] ? Number(gig.packages[0].price) : 0;
  const percent = activeCampaignPercent(pricing, gig.id);
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
    sponsored: isSponsored(gig.sponsoredUntil),
    seller: {
      id: gig.seller.id,
      name: gig.seller.name,
      title: gig.seller.title,
      image: gig.seller.image,
      isOnline: gig.seller.isOnline,
      isPro: tier !== null,
      isProPlus: tier === "PRO_PLUS",
      emailVerified: Boolean(gig.seller.emailVerified),
      isFounder: gig.seller.founderNumber !== null,
    },
    categoryName: gig.category.name,
    categorySlug: gig.category.slug,
    categoryIcon: gig.category.icon,
    subcategoryName: gig.subcategory?.name ?? null,
    subcategorySlug: gig.subcategory?.slug ?? null,
    startingPrice: campaignPrice(listPrice, percent),
    rating,
    reviewCount,
    campaign: percent && pricing.campaign ? { name: pricing.campaign.name, percent, listPrice } : null,
  };
}

export async function getFeaturedGigs(limit = 6): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    where: { published: true },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  const pricing = await getCampaignPricing();
  return gigs.map((g) => toCardData(g, pricing));
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
  founder: boolean;
  pro: boolean;
  plus: boolean;
  sponsored: boolean;
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
      ...(filters.proSellersOnly ? proMemberWhere() : {}),
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
        tier: { not: "CUSTOM" },
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

  const pricing = await getCampaignPricing();
  const thin = await prisma.gig.findMany({
    where,
    orderBy,
    select: {
      id: true,
      coverImage: true,
      sponsoredUntil: true,
      seller: { select: { image: true, founderNumber: true, ...membershipSelect } },
      packages: { where: { tier: { not: "CUSTOM" as const } }, orderBy: { price: "asc" }, take: 1, select: { price: true } },
    },
  });

  const now = new Date();
  let sortable: SortableGig[] = thin.map((g) => ({
    id: g.id,
    coverImage: g.coverImage,
    sellerImage: g.seller.image,
    founder: g.seller.founderNumber !== null,
    pro: membershipTier(g.seller, now) !== null,
    plus: membershipTier(g.seller, now) === "PRO_PLUS",
    sponsored: isSponsored(g.sponsoredUntil),
    // Sort by what the buyer would pay right now, campaign discount included.
    startingPrice: campaignPrice(
      g.packages[0] ? Number(g.packages[0].price) : 0,
      activeCampaignPercent(pricing, g.id)
    ),
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

  // Varsayılan sıralamada önce Kurucu Freelancer'lar, sonra Pro Plus, sonra Pro üyeler öne
  // çıkar — geçişler kararlı olduğu için her grubun içinde önceki sıralamalar korunuyor.
  // Alıcının seçtiği fiyat/yeni sıralamalarına dokunulmuyor.
  if (!filters.sort || filters.sort === "uygun") {
    sortable = sortable.sort((a, b) => (a.pro ? 0 : 1) - (b.pro ? 0 : 1));
    sortable = sortable.sort((a, b) => (a.plus ? 0 : 1) - (b.plus ? 0 : 1));
    sortable = sortable.sort((a, b) => (a.founder ? 0 : 1) - (b.founder ? 0 : 1));
    // Paid "Öne Çıkar" leads above everything; the card says "Sponsorlu" so it is not
    // mistaken for an organic ranking.
    sortable = sortable.sort((a, b) => (a.sponsored ? 0 : 1) - (b.sponsored ? 0 : 1));
  }

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
  const cards = pageIds.map((id) => byId.get(id)).filter((g): g is RawGig => Boolean(g)).map((g) => toCardData(g, pricing));

  return { cards, total, page, pageCount };
}

/** Gigs that joined the campaign in `pricing`, biggest discount first. */
export async function listCampaignGigs(pricing: CampaignPricing, limit = 60): Promise<GigCardData[]> {
  if (!pricing.campaign) return [];
  const gigs = await prisma.gig.findMany({
    where: {
      published: true,
      campaignEntries: { some: { campaignId: pricing.campaign.id } },
      seller: { synthetic: false, suspended: false },
    },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return gigs
    .map((g) => toCardData(g, pricing))
    .sort((a, b) => (b.campaign?.percent ?? 0) - (a.campaign?.percent ?? 0));
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
  const pricing = await getCampaignPricing();
  return gigs.map((g) => toCardData(g, pricing));
}

export async function getGigsBySeller(sellerId: string): Promise<GigCardData[]> {
  const gigs = await prisma.gig.findMany({
    where: { sellerId, published: true },
    include: gigCardInclude,
    orderBy: { createdAt: "desc" },
  });
  const pricing = await getCampaignPricing();
  return gigs.map((g) => toCardData(g, pricing));
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
          ...membershipSelect,
          emailVerified: true,
          synthetic: true,
          suspended: true,
          founderNumber: true,
        },
      },
      category: { select: { name: true, slug: true, icon: true } },
      subcategory: { select: { name: true, slug: true } },
      packages: { where: { tier: { not: "CUSTOM" as const } }, orderBy: { price: "asc" } },
      reviews: {
        include: { buyer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return gig;
}
