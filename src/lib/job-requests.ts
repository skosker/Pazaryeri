import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { maskContactInfo } from "@/lib/messaging";
import { istanbulMonth, membershipSelect, membershipTier, type Tier } from "@/lib/membership";
import { firstOrderDiscount, sellerTakesOrders } from "@/lib/orders";
import { siteUrl } from "@/lib/site-url";
import { sendJobRequestDigestEmails, type JobRequestDigest } from "@/lib/email";
import { unsubscribeOneClickUrl, unsubscribePageUrl } from "@/lib/email-preferences";

/**
 * İş talepleri: a buyer describes a job, freelancers answer with an offer made on one of
 * their own gigs, and the buyer accepts one. Acceptance adds a CUSTOM package to that gig
 * and opens an ordinary order on it, so payment, escrow, delivery, reviews, payout and
 * commission all run the way they do for any order.
 */

export class JobRequestError extends Error {}

export const JOB_LIMITS = {
  titleMin: 10,
  titleMax: 100,
  descriptionMin: 30,
  descriptionMax: 3000,
  messageMin: 20,
  messageMax: 1500,
  budgetMin: 100,
  budgetMax: 1_000_000,
  daysMax: 365,
} as const;

/** A request still taking offers right now. */
export function isOpen(request: { status: string; expiresAt: Date }, now = new Date()): boolean {
  return request.status === "OPEN" && request.expiresAt > now;
}

export const openRequestWhere = (now = new Date()): Prisma.JobRequestWhereInput => ({
  status: "OPEN",
  expiresAt: { gt: now },
});

/** "Ayşe Y." — buyers are shown by first name and initial on public pages. */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0]?.toLocaleUpperCase("tr")}.`;
}

export function offerQuota(tier: Tier, settings: SiteSettings): number {
  if (tier === "PRO_PLUS") return settings.offerQuotaPlus;
  if (tier === "PRO") return settings.offerQuotaPro;
  return settings.offerQuotaFree;
}

function monthStart(now = new Date()): Date {
  const [y, m] = istanbulMonth(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, -3));
}

/** Offers the freelancer has sent this Istanbul month (withdrawn ones still count). */
export async function offerUsage(sellerId: string) {
  const [settings, user, used] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({ where: { id: sellerId }, select: membershipSelect }),
    prisma.jobOffer.count({ where: { sellerId, createdAt: { gte: monthStart() } } }),
  ]);
  const tier = user ? membershipTier(user) : null;
  const quota = offerQuota(tier, settings);
  return { used, quota, left: Math.max(0, quota - used), tier };
}

export type RequestInput = {
  title: string;
  description: string;
  categoryId: string;
  budgetMin: number;
  budgetMax: number;
  deliveryDays: number;
};

function checkRequest(input: RequestInput) {
  const L = JOB_LIMITS;
  if (input.title.length < L.titleMin || input.title.length > L.titleMax) {
    throw new JobRequestError(`Başlık ${L.titleMin}–${L.titleMax} karakter olmalı.`);
  }
  if (input.description.length < L.descriptionMin || input.description.length > L.descriptionMax) {
    throw new JobRequestError(`Açıklama ${L.descriptionMin}–${L.descriptionMax} karakter olmalı.`);
  }
  const whole = (n: number) => Number.isInteger(n);
  if (!whole(input.budgetMin) || !whole(input.budgetMax) || input.budgetMin < L.budgetMin || input.budgetMax > L.budgetMax) {
    throw new JobRequestError(`Bütçe ${L.budgetMin.toLocaleString("tr-TR")} ile ${L.budgetMax.toLocaleString("tr-TR")} TL arasında tam sayı olmalı.`);
  }
  if (input.budgetMin > input.budgetMax) throw new JobRequestError("En düşük bütçe en yüksekten büyük olamaz.");
  if (!whole(input.deliveryDays) || input.deliveryDays < 1 || input.deliveryDays > L.daysMax) {
    throw new JobRequestError("Teslim süresi 1 ile 365 gün arasında olmalı.");
  }
}

export async function createJobRequest(buyerId: string, input: RequestInput) {
  const settings = await getSettings();
  if (!settings.jobRequestsEnabled) throw new JobRequestError("İş talepleri şu an kapalı.");
  checkRequest(input);
  const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  if (!category) throw new JobRequestError("Kategori seç.");
  // Too many open requests at once reads as spam; five is plenty for a real buyer.
  const open = await prisma.jobRequest.count({ where: { buyerId, ...openRequestWhere() } });
  if (open >= 5) throw new JobRequestError("Aynı anda en fazla 5 açık talebin olabilir; birini kapatıp yenisini aç.");

  return prisma.jobRequest.create({
    data: {
      buyerId,
      categoryId: input.categoryId,
      title: maskContactInfo(input.title).body,
      description: maskContactInfo(input.description).body,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      deliveryDays: input.deliveryDays,
      expiresAt: new Date(Date.now() + settings.jobRequestDays * 24 * 60 * 60 * 1000),
    },
  });
}

/** The buyer closes their own open request; pending offers are declined. */
export async function closeJobRequest(buyerId: string, requestId: string) {
  await prisma.$transaction([
    prisma.jobRequest.updateMany({ where: { id: requestId, buyerId, status: "OPEN" }, data: { status: "CLOSED" } }),
    prisma.jobOffer.updateMany({
      where: { requestId, status: "PENDING", request: { buyerId } },
      data: { status: "DECLINED" },
    }),
  ]);
}

export type OfferInput = { gigId: string; price: number; deliveryDays: number; message: string };

/** Send or update this freelancer's offer on a request (one per request). */
export async function saveOffer(sellerId: string, requestId: string, input: OfferInput) {
  const settings = await getSettings();
  if (!settings.jobRequestsEnabled) throw new JobRequestError("İş talepleri şu an kapalı.");
  const request = await prisma.jobRequest.findUnique({
    where: { id: requestId },
    select: { status: true, expiresAt: true, buyerId: true },
  });
  if (!request || !isOpen(request)) throw new JobRequestError("Bu talep artık teklif almıyor.");
  if (request.buyerId === sellerId) throw new JobRequestError("Kendi talebine teklif veremezsin.");

  const gig = await prisma.gig.findUnique({
    where: { id: input.gigId },
    select: { sellerId: true, published: true, status: true, seller: { select: { synthetic: true, suspended: true } } },
  });
  if (!gig || gig.sellerId !== sellerId || !gig.published || gig.status !== "APPROVED") {
    throw new JobRequestError("Teklifi yayındaki ilanlarından biriyle vermelisin.");
  }
  if (!sellerTakesOrders(gig.seller)) throw new JobRequestError("Hesabın şu an sipariş alamıyor.");

  const L = JOB_LIMITS;
  if (!Number.isFinite(input.price) || input.price < L.budgetMin || input.price > L.budgetMax) {
    throw new JobRequestError(`Fiyat ${L.budgetMin.toLocaleString("tr-TR")} TL ile ${L.budgetMax.toLocaleString("tr-TR")} TL arasında olmalı.`);
  }
  if (!Number.isInteger(input.deliveryDays) || input.deliveryDays < 1 || input.deliveryDays > L.daysMax) {
    throw new JobRequestError("Teslim süresi 1 ile 365 gün arasında olmalı.");
  }
  if (input.message.length < L.messageMin || input.message.length > L.messageMax) {
    throw new JobRequestError(`Ön yazı ${L.messageMin}–${L.messageMax} karakter olmalı.`);
  }
  const data = {
    gigId: input.gigId,
    price: Math.round(input.price * 100) / 100,
    deliveryDays: input.deliveryDays,
    message: maskContactInfo(input.message).body,
  };

  const existing = await prisma.jobOffer.findUnique({ where: { requestId_sellerId: { requestId, sellerId } } });
  if (existing) {
    if (existing.status === "ACCEPTED" || existing.status === "DECLINED") {
      throw new JobRequestError("Bu teklif sonuçlandı, değiştirilemez.");
    }
    // Editing (or re-sending a withdrawn offer) does not use another offer from the quota.
    return { offer: await prisma.jobOffer.update({ where: { id: existing.id }, data: { ...data, status: "PENDING" } }), isNew: false };
  }

  const usage = await offerUsage(sellerId);
  if (usage.left <= 0) {
    throw new JobRequestError(
      `Bu ayki ${usage.quota} teklif hakkını kullandın. Pro üyelikle daha fazla teklif verebilirsin.`
    );
  }
  return { offer: await prisma.jobOffer.create({ data: { ...data, requestId, sellerId } }), isNew: true };
}

export async function withdrawOffer(sellerId: string, offerId: string) {
  await prisma.jobOffer.updateMany({ where: { id: offerId, sellerId, status: "PENDING" }, data: { status: "WITHDRAWN" } });
}

/**
 * The buyer accepts an offer: in one transaction the request is marked hired (only if it
 * is still open, so a double click cannot hire twice), a CUSTOM package is added to the
 * offer's gig, the order is opened on it and the other offers are declined. Returns the
 * order id for the checkout page.
 */
export async function acceptOffer(buyerId: string, offerId: string): Promise<string> {
  const offer = await prisma.jobOffer.findUnique({
    where: { id: offerId },
    include: {
      request: { select: { id: true, buyerId: true, status: true, expiresAt: true, title: true } },
      gig: { select: { id: true, published: true, status: true, seller: { select: { synthetic: true, suspended: true } } } },
    },
  });
  if (!offer || offer.request.buyerId !== buyerId) throw new JobRequestError("Teklif bulunamadı.");
  if (offer.status !== "PENDING") throw new JobRequestError("Bu teklif artık geçerli değil.");
  if (!isOpen(offer.request)) throw new JobRequestError("Bu talep kapanmış.");
  if (!offer.gig.published || offer.gig.status !== "APPROVED" || !sellerTakesOrders(offer.gig.seller)) {
    throw new JobRequestError("Bu freelancer şu an sipariş alamıyor.");
  }

  const price = Number(offer.price);
  const discount = await firstOrderDiscount(buyerId, price);

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.jobRequest.updateMany({
      where: { id: offer.request.id, buyerId, status: "OPEN" },
      data: { status: "HIRED" },
    });
    if (count === 0) throw new JobRequestError("Bu talep kapanmış.");

    const pkg = await tx.package.create({
      data: {
        gigId: offer.gig.id,
        tier: "CUSTOM",
        name: "Özel Teklif",
        description: `${offer.request.title}\n\n${offer.message}`.slice(0, 2000),
        price,
        deliveryDays: offer.deliveryDays,
        revisionCount: 2,
      },
    });
    const order = await tx.order.create({
      data: { buyerId, gigId: offer.gig.id, packageId: pkg.id, amount: price, discount },
    });
    await tx.jobOffer.update({ where: { id: offer.id }, data: { status: "ACCEPTED", orderId: order.id } });
    await tx.jobOffer.updateMany({
      where: { requestId: offer.request.id, status: "PENDING", id: { not: offer.id } },
      data: { status: "DECLINED" },
    });
    return order.id;
  });
}

/** Public list: open requests, newest first, optionally one category and a text search. */
export async function listOpenRequests(filters: { categorySlug?: string; q?: string; page?: number; pageSize?: number }) {
  const pageSize = filters.pageSize ?? 20;
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.JobRequestWhereInput = {
    ...openRequestWhere(),
    ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.jobRequest.count({ where }),
    prisma.jobRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        budgetMin: true,
        budgetMax: true,
        deliveryDays: true,
        createdAt: true,
        expiresAt: true,
        category: { select: { name: true, slug: true } },
        buyer: { select: { name: true } },
        _count: { select: { offers: { where: { status: { not: "WITHDRAWN" } } } } },
      },
    }),
  ]);
  return { total, rows, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export function budgetLabel(min: number, max: number): string {
  const f = (n: number) => n.toLocaleString("tr-TR");
  return min === max ? `${f(min)} TL` : `${f(min)}–${f(max)} TL`;
}

/** "3 saat önce", "2 gün önce". */
export function timeAgo(date: Date, now = new Date()): string {
  const minutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}

/**
 * Daily (from the cron): e-mail each freelancer the requests opened in the last 24 hours
 * in the categories of their published gigs, leaving out their own requests and ones they
 * already answered. Skipped entirely while the feature is off. Returns how many were sent.
 */
export async function sendJobRequestDigests(now = new Date()): Promise<number> {
  if (!(await getSettings()).jobRequestsEnabled) return 0;
  const requests = await prisma.jobRequest.findMany({
    where: { ...openRequestWhere(now), createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, budgetMin: true, budgetMax: true, categoryId: true, buyerId: true,
      offers: { select: { sellerId: true } },
    },
  });
  if (requests.length === 0) return 0;

  const freelancers = await prisma.user.findMany({
    where: {
      role: "FREELANCER",
      synthetic: false,
      suspended: false,
      jobRequestEmails: true,
      gigs: { some: { published: true, status: "APPROVED", categoryId: { in: [...new Set(requests.map((r) => r.categoryId))] } } },
    },
    select: {
      id: true, email: true, name: true,
      gigs: { where: { published: true, status: "APPROVED" }, select: { categoryId: true } },
    },
  });

  const digests: JobRequestDigest[] = [];
  for (const f of freelancers) {
    const categories = new Set(f.gigs.map((g) => g.categoryId));
    const mine = requests.filter(
      (r) => categories.has(r.categoryId) && r.buyerId !== f.id && !r.offers.some((o) => o.sellerId === f.id)
    );
    if (mine.length === 0) continue;
    digests.push({
      email: f.email,
      name: f.name,
      requests: mine.slice(0, 10).map((r) => ({
        title: r.title,
        budget: budgetLabel(r.budgetMin, r.budgetMax),
        url: `${siteUrl}/is-talepleri/${r.id}`,
      })),
      unsubscribeUrl: unsubscribePageUrl(f.id, "is-talebi"),
      oneClickUrl: unsubscribeOneClickUrl(f.id, "is-talebi"),
    });
  }
  return digests.length ? sendJobRequestDigestEmails(digests, `${siteUrl}/is-talepleri`) : 0;
}
