import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { membershipSelect, membershipTier, plusMemberWhere, proMemberWhere } from "@/lib/membership";

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
  isProPlus: boolean;
  isFounder: boolean;
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
  // proMemberWhere is an OR of its own; kept under AND so the search OR below cannot replace it.
  if (filters.proOnly) where.AND = [proMemberWhere()];

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
  ...membershipSelect,
  founderNumber: true,
  _count: { select: { gigs: true } },
} satisfies Prisma.UserSelect;

// Whoever is available right now comes first — the same signal the gig cards show —
// then alphabetical, with the id as a tie-break so paging never repeats or drops
// somebody between two pages.
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
  // Pro Plus members lead the directory (a membership perk), then real photos, then the rest.
  const plus = plusMemberWhere();
  const groups: Prisma.UserWhereInput[] = [
    { AND: [where, plus] },
    { AND: [where, realPhoto, { NOT: plus }] },
    { AND: [where, drawnOrNoPhoto, { NOT: plus }] },
  ];

  const counts = await Promise.all(groups.map((group) => prisma.user.count({ where: group })));
  const total = counts.reduce((sum, n) => sum + n, 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  // Walk the groups in order, taking the slice of each that falls on this page.
  const paged: Prisma.UserGetPayload<{ select: typeof cardSelect }>[] = [];
  let offset = 0;
  for (const [i, group] of groups.entries()) {
    const skip = Math.max(0, start - offset);
    const take = pageSize - paged.length;
    offset += counts[i];
    if (take <= 0) break;
    if (skip >= counts[i]) continue;
    paged.push(
      ...(await prisma.user.findMany({ where: group, select: cardSelect, orderBy: directoryOrder, skip, take }))
    );
  }

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
        isPro: membershipTier(row) !== null,
        isProPlus: membershipTier(row) === "PRO_PLUS",
        isFounder: row.founderNumber !== null,
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
