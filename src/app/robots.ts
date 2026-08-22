import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Search engines get the public catalogue and nothing else. The signed-in areas are
 * behind auth anyway, but keeping them out of the crawl budget — and out of results —
 * is worth stating rather than leaving to chance.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel/", "/admin/", "/api/", "/odeme/", "/siparis/", "/sifre-sifirla"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
