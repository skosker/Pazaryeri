import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";

/**
 * Every page worth indexing: the fixed pages, one per category, and one per published
 * listing. Freelancer profiles are left out on purpose — they are personal pages of
 * people who did not ask to be indexed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/kategoriler",
    "/freelancerlar",
    "/nasil-calisir",
    "/hakkimizda",
    "/uyelik-sozlesmesi",
    "/kullanim-sartlari",
    "/gizlilik-politikasi",
    "/cerez-tercihleri",
    "/giris",
    "/kayit",
  ];

  const [categories, gigs] = await Promise.all([
    prisma.category.findMany({ select: { slug: true }, orderBy: { order: "asc" } }),
    prisma.gig.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/kategoriler?kategori=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...gigs.map((gig) => ({
      url: `${siteUrl}/gig/${gig.slug}`,
      lastModified: gig.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
