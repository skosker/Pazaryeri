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

  if (filters.title) where.title = filters.title;
  if (filters.onlineOnly) where.isOnline = true;

  if (filters.q) {
    const q = filters.q.trim();
    if (q.length > 0) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        // Skills are stored as whole labels, so this matches "Figma", not "fig".
        { skills: { has: q } },
      ];
    }
  }

  return where;
}

/** 0 for a freelancer with a real photo, 1 for a drawn avatar (or none) — mirrors
 * gigs.ts's photoRank, so a listing that still has the auto-drawn placeholder sinks to
 * the back of the directory the same way it already does among a category's gig cards. */
function photoRank(image: string | null): number {
  return image && !image.startsWith("/api/avatar/") ? 0 : 1;
}

export async function listFreelancers(filters: FreelancerFilters): Promise<FreelancerListResult> {
  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);

  const rows = await prisma.user.findMany({
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
  });

  // Still-drawn-avatar profiles sink to the very back of the whole directory, not just
  // their own page. A stable sort (Node/V8) keeps the ordering above intact within each
  // of the two groups this splits the list into.
  rows.sort((a, b) => photoRank(a.image) - photoRank(b.image));

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paged = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const reviews = await prisma.review.findMany({
    where: { gig: { sellerId: { in: paged.map((row) => row.id) } } },
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
    cards: paged.map((row) => {
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
    pageCount,
  };
}

/** Professions that actually have freelancers, for the filter menu. */
export async function getFreelancerFacets() {
  const base: Prisma.UserWhereInput = { role: "FREELANCER", suspended: false };

  const titles = await prisma.user.groupBy({
    by: ["title"],
    where: { ...base, title: { not: null } },
    _count: { _all: true },
    orderBy: { title: "asc" },
  });

  return {
    titles: titles.map((row) => ({ name: row.title as string, count: row._count._all })),
  };
}
