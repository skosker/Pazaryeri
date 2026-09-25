import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Campaign and membership settings, editable at /admin/ayarlar. Read on the server and
 * pass the numbers down — a client component must not import this (it pulls Prisma in).
 */
export type SiteSettings = {
  /** Üyelik paketleri (yalnızca freelancer'lar): aylık fiyatlar. */
  proMonthlyTl: number;
  plusMonthlyTl: number;
  /** Yıllık ödemede aylık fiyattan indirim; 20 means %20. */
  yearlyDiscountPercent: number;
  proTrialEnabled: boolean;
  proTrialDays: number;
  /** Üyelikle her ay gelen ücretsiz Öne Çıkar süresi (gün). */
  proFreeBoostDays: number;
  plusFreeBoostDays: number;
  /** Pro Plus'ın Öne Çıkar satın alma indirimi; 25 means %25. */
  plusBoostDiscountPercent: number;
  portfolioImages: number;
  portfolioImagesPro: number;
  portfolioImagesPlus: number;
  boostEnabled: boolean;
  boostPriceTl: number;
  boostDays: number;
  /** 2.5 means %2,5. */
  commissionPercent: number;
  /** KDV on Prosinta's own sales, whose prices include it; 20 means %20. */
  vatPercent: number;
  founderEnabled: boolean;
  founderLimit: number;
  firstOrderEnabled: boolean;
  /** 5 means %5. */
  firstOrderPercent: number;
  firstOrderMaxTl: number;
  referralEnabled: boolean;
  referralRewardTl: number;
  corporateEnabled: boolean;
  corporateMinTopUpTl: number;
  /** 3 means %3. */
  corporateBonusPercent: number;
  /** Kurumsal abonelik paketleri (Kurumsal / Kurumsal Plus). */
  corporatePlansEnabled: boolean;
  corpMonthlyTl: number;
  corpPlusMonthlyTl: number;
  corpOrderDiscountPercent: number;
  corpOrderDiscountMaxTl: number;
  corpPlusOrderDiscountPercent: number;
  corpPlusOrderDiscountMaxTl: number;
  corpTopUpBonusPercent: number;
  corpPlusTopUpBonusPercent: number;
};

/** Used until an admin first saves the settings form (mirrors the schema defaults). */
export const DEFAULT_SETTINGS: SiteSettings = {
  proMonthlyTl: 1000,
  plusMonthlyTl: 1250,
  yearlyDiscountPercent: 20,
  proTrialEnabled: false,
  proTrialDays: 30,
  proFreeBoostDays: 3,
  plusFreeBoostDays: 10,
  plusBoostDiscountPercent: 25,
  portfolioImages: 5,
  portfolioImagesPro: 12,
  portfolioImagesPlus: 20,
  boostEnabled: true,
  boostPriceTl: 1000,
  boostDays: 30,
  commissionPercent: 2.5,
  vatPercent: 20,
  founderEnabled: true,
  founderLimit: 5000,
  firstOrderEnabled: true,
  firstOrderPercent: 5,
  firstOrderMaxTl: 500,
  referralEnabled: true,
  referralRewardTl: 200,
  corporateEnabled: false,
  corporateMinTopUpTl: 5000,
  corporateBonusPercent: 0,
  corporatePlansEnabled: false,
  corpMonthlyTl: 1500,
  corpPlusMonthlyTl: 3500,
  corpOrderDiscountPercent: 3,
  corpOrderDiscountMaxTl: 1000,
  corpPlusOrderDiscountPercent: 5,
  corpPlusOrderDiscountMaxTl: 3000,
  corpTopUpBonusPercent: 1,
  corpPlusTopUpBonusPercent: 2,
};

/** One read per request however many components ask. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_SETTINGS;
  return {
    proMonthlyTl: Number(row.proMonthlyTl),
    plusMonthlyTl: Number(row.plusMonthlyTl),
    yearlyDiscountPercent: Number(row.yearlyDiscountPercent),
    proTrialEnabled: row.proTrialEnabled,
    proTrialDays: row.proTrialDays,
    proFreeBoostDays: row.proFreeBoostDays,
    plusFreeBoostDays: row.plusFreeBoostDays,
    plusBoostDiscountPercent: Number(row.plusBoostDiscountPercent),
    portfolioImages: row.portfolioImages,
    portfolioImagesPro: row.portfolioImagesPro,
    portfolioImagesPlus: row.portfolioImagesPlus,
    boostEnabled: row.boostEnabled,
    boostPriceTl: Number(row.boostPriceTl),
    boostDays: row.boostDays,
    commissionPercent: Number(row.commissionPercent),
    vatPercent: Number(row.vatPercent),
    founderEnabled: row.founderEnabled,
    founderLimit: row.founderLimit,
    firstOrderEnabled: row.firstOrderEnabled,
    firstOrderPercent: Number(row.firstOrderPercent),
    firstOrderMaxTl: Number(row.firstOrderMaxTl),
    referralEnabled: row.referralEnabled,
    referralRewardTl: Number(row.referralRewardTl),
    corporateEnabled: row.corporateEnabled,
    corporateMinTopUpTl: Number(row.corporateMinTopUpTl),
    corporateBonusPercent: Number(row.corporateBonusPercent),
    corporatePlansEnabled: row.corporatePlansEnabled,
    corpMonthlyTl: Number(row.corpMonthlyTl),
    corpPlusMonthlyTl: Number(row.corpPlusMonthlyTl),
    corpOrderDiscountPercent: Number(row.corpOrderDiscountPercent),
    corpOrderDiscountMaxTl: Number(row.corpOrderDiscountMaxTl),
    corpPlusOrderDiscountPercent: Number(row.corpPlusOrderDiscountPercent),
    corpPlusOrderDiscountMaxTl: Number(row.corpPlusOrderDiscountMaxTl),
    corpTopUpBonusPercent: Number(row.corpTopUpBonusPercent),
    corpPlusTopUpBonusPercent: Number(row.corpPlusTopUpBonusPercent),
  };
});

/** Saves the fields given; the rest keep their stored (or default) values. */
export async function saveSettings(settings: Partial<SiteSettings>): Promise<void> {
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
