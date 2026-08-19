import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Reading side of the freelancer directory: who is on the marketplace, filtered by what
 * they do and where they are. Ratings come from the reviews on their listings, which is
 * one extra query per page rather than a join per row.
 */

export type FreelancerCardData = {
  id: string;
  name: string;
  title: string | null;
  city: string | null;
  age: number | null;
  skills: string[];
  image: string | null;
  isOnline: boolean;
  isPro: boolean;
  gigCount: number;
  rating: number | null;
  reviewCount: number;
};

export type FreelancerFilters = {
  q?: string;
  city?: string;
  title?: string;
  onlineOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export type FreelancerListResult = {
  cards: FreelancerCardData[];
  total: number;
  page: number;
  pageCount: number;
};

function buildWhere(filters: FreelancerFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: "FREELANCER", suspended: false };

  if (filters.city) where.city = filters.city;
  if (filters.title) where.title = filters.title;
  if (filters.onlineOnly) where.isOnline = true;

  if (filters.q) {
    const q = filters.q.trim();
    if (q.length > 0) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        // Skills are stored as whole labels, so this matches "Figma", not "fig".
        { skills: { has: q } },
      ];
    }
  }

  return where;
}

export async function listFreelancers(filters: FreelancerFilters): Promise<FreelancerListResult> {
  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        title: true,
        city: true,
        age: true,
        skills: true,
        image: true,
        isOnline: true,
        isPro: true,
        _count: { select: { gigs: true } },
      },
      // Whoever is available right now comes first — the same signal the gig cards
      // show — then alphabetical, with the id as a tie-break so paging never repeats or
      // drops somebody between two pages. Pro is a badge here, not a ranking, which is
      // how the gig list treats it too.
      orderBy: [{ isOnline: "desc" }, { name: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const reviews = await prisma.review.findMany({
    where: { gig: { sellerId: { in: rows.map((row) => row.id) } } },
    select: { rating: true, gig: { select: { sellerId: true } } },
  });

  const ratingsBySeller = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const current = ratingsBySeller.get(review.gig.sellerId) ?? { sum: 0, count: 0 };
    ratingsBySeller.set(review.gig.sellerId, {
      sum: current.sum + review.rating,
      count: current.count + 1,
    });
  }

  return {
    cards: rows.map((row) => {
      const rating = ratingsBySeller.get(row.id);
      return {
        id: row.id,
        name: row.name,
        title: row.title,
        city: row.city,
        age: row.age,
        skills: row.skills,
        image: row.image,
        isOnline: row.isOnline,
        isPro: row.isPro,
        gigCount: row._count.gigs,
        rating: rating ? rating.sum / rating.count : null,
        reviewCount: rating?.count ?? 0,
      };
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Cities and professions that actually have freelancers, for the filter menus. */
export async function getFreelancerFacets() {
  const base: Prisma.UserWhereInput = { role: "FREELANCER", suspended: false };

  const [cities, titles] = await Promise.all([
    prisma.user.groupBy({
      by: ["city"],
      where: { ...base, city: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
    }),
    prisma.user.groupBy({
      by: ["title"],
      where: { ...base, title: { not: null } },
      _count: { _all: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return {
    cities: cities.map((row) => ({ name: row.city as string, count: row._count._all })),
    titles: titles.map((row) => ({ name: row.title as string, count: row._count._all })),
  };
}
