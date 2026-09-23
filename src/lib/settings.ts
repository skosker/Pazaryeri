import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Campaign and membership settings, editable at /admin/ayarlar. Read on the server and
 * pass the numbers down — a client component must not import this (it pulls Prisma in).
 */
export type SiteSettings = {
  proPriceTl: number;
  portfolioImages: number;
  portfolioImagesPro: number;
  boostEnabled: boolean;
  boostPriceTl: number;
  boostDays: number;
  /** 2.5 means %2,5. */
  commissionPercent: number;
  founderEnabled: boolean;
  founderLimit: number;
};

/** Used until an admin first saves the settings form (mirrors the schema defaults). */
export const DEFAULT_SETTINGS: SiteSettings = {
  proPriceTl: 1000,
  portfolioImages: 5,
  portfolioImagesPro: 12,
  boostEnabled: true,
  boostPriceTl: 1000,
  boostDays: 30,
  commissionPercent: 2.5,
  founderEnabled: true,
  founderLimit: 100,
};

/** One read per request however many components ask. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_SETTINGS;
  return {
    proPriceTl: Number(row.proPriceTl),
    portfolioImages: row.portfolioImages,
    portfolioImagesPro: row.portfolioImagesPro,
    boostEnabled: row.boostEnabled,
    boostPriceTl: Number(row.boostPriceTl),
    boostDays: row.boostDays,
    commissionPercent: Number(row.commissionPercent),
    founderEnabled: row.founderEnabled,
    founderLimit: row.founderLimit,
  };
});

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...settings },
    update: settings,
  });
}

/** "%2,5" — for admin-facing labels. */
export function formatPercent(value: number): string {
  return `%${value.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
}
