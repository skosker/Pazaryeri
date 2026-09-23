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
  onlineOnly?: boolean;
  proOnly?: boolean;
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

  if (filters.onlineOnly) where.isOnline = true;
  if (filters.proOnly) where.isPro = true;

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

const cardSelect = {
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
} satisfies Prisma.UserSelect;

// Whoever is available right now comes first — the same signal the gig cards show —
// then alphabetical, with the id as a tie-break so paging never repeats or drops
// somebody between two pages. Pro is a badge here, not a ranking, which is how the gig
// list treats it too.
const directoryOrder: Prisma.UserOrderByWithRelationInput[] = [
  { isOnline: "desc" },
  { name: "asc" },
  { id: "asc" },
];

// Profiles with a real photo come before the still-drawn-avatar ones across the whole
// directory, not just within a page. Splitting the list into these two groups and
// paging through them in turn keeps that order while letting the database return only
// the page being shown — the directory holds ~13k freelancers, and loading all of them
// to sort in memory on every visit was enough traffic to exhaust the database plan's
// monthly transfer allowance.
const realPhoto: Prisma.UserWhereInput = {
  AND: [
    { image: { not: null } },
    { image: { not: "" } },
    { NOT: { image: { startsWith: "/api/avatar/" } } },
  ],
};
const drawnOrNoPhoto: Prisma.UserWhereInput = {
  OR: [{ image: null }, { image: "" }, { image: { startsWith: "/api/avatar/" } }],
};

export async function listFreelancers(filters: FreelancerFilters): Promise<FreelancerListResult> {
  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);
  const withPhoto: Prisma.UserWhereInput = { AND: [where, realPhoto] };
  const withoutPhoto: Prisma.UserWhereInput = { AND: [where, drawnOrNoPhoto] };

  const [photoCount, noPhotoCount] = await Promise.all([
    prisma.user.count({ where: withPhoto }),
    prisma.user.count({ where: withoutPhoto }),
  ]);

  const total = photoCount + noPhotoCount;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  const fromPhoto =
    start < photoCount
      ? await prisma.user.findMany({
          where: withPhoto,
          select: cardSelect,
          orderBy: directoryOrder,
          skip: start,
          take: Math.min(pageSize, photoCount - start),
        })
      : [];
  const remaining = pageSize - fromPhoto.length;
  const fromNoPhoto =
    remaining > 0
      ? await prisma.user.findMany({
          where: withoutPhoto,
          select: cardSelect,
          orderBy: directoryOrder,
          skip: Math.max(0, start - photoCount),
          take: remaining,
        })
      : [];
  const paged = [...fromPhoto, ...fromNoPhoto];

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
