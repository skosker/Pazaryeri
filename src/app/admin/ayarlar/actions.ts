"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { formNumber as num, isPrice, isWhole, round2 } from "@/app/admin/settings-fields";

export type SettingsFormState = { error?: string; saved?: boolean };

/** Üyelik ve gelir: Pro, Öne Çıkar, komisyon, Kurucu Freelancer, kurumsal paket. */
export async function saveMembershipSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const s: Partial<SiteSettings> = {
    proMonthlyTl: num(formData, "proMonthlyTl"),
    plusMonthlyTl: num(formData, "plusMonthlyTl"),
    yearlyDiscountPercent: num(formData, "yearlyDiscountPercent"),
    proTrialEnabled: formData.get("proTrialEnabled") === "on",
    proTrialDays: num(formData, "proTrialDays"),
    proFreeBoostDays: num(formData, "proFreeBoostDays"),
    plusFreeBoostDays: num(formData, "plusFreeBoostDays"),
    plusBoostDiscountPercent: num(formData, "plusBoostDiscountPercent"),
    portfolioImages: num(formData, "portfolioImages"),
    portfolioImagesPro: num(formData, "portfolioImagesPro"),
    portfolioImagesPlus: num(formData, "portfolioImagesPlus"),
    boostEnabled: formData.get("boostEnabled") === "on",
    boostPriceTl: num(formData, "boostPriceTl"),
    boostDays: num(formData, "boostDays"),
    commissionPercent: num(formData, "commissionPercent"),
    founderEnabled: formData.get("founderEnabled") === "on",
    founderLimit: num(formData, "founderLimit"),
    corporateEnabled: formData.get("corporateEnabled") === "on",
    corporateMinTopUpTl: num(formData, "corporateMinTopUpTl"),
    corporateBonusPercent: num(formData, "corporateBonusPercent"),
  };

  if (!isPrice(s.proMonthlyTl!) || !isPrice(s.plusMonthlyTl!)) {
    return { error: "Üyelik fiyatları 0 ile 1.000.000 TL arasında olmalı." };
  }
  if (!(Number.isFinite(s.yearlyDiscountPercent) && s.yearlyDiscountPercent! >= 0 && s.yearlyDiscountPercent! <= 90)) {
    return { error: "Yıllık indirim %0 ile %90 arasında olmalı." };
  }
  if (!isWhole(s.proTrialDays!, 1, 365)) return { error: "Deneme süresi 1 ile 365 gün arasında olmalı." };
  if (!isWhole(s.proFreeBoostDays!, 0, 60) || !isWhole(s.plusFreeBoostDays!, 0, 60)) {
    return { error: "Aylık ücretsiz Öne Çıkar süresi 0 ile 60 gün arasında olmalı." };
  }
  if (!(Number.isFinite(s.plusBoostDiscountPercent) && s.plusBoostDiscountPercent! >= 0 && s.plusBoostDiscountPercent! <= 100)) {
    return { error: "Pro Plus Öne Çıkar indirimi %0 ile %100 arasında olmalı." };
  }
  if (!isPrice(s.boostPriceTl!)) return { error: "Öne Çıkar fiyatı 0 ile 1.000.000 TL arasında olmalı." };
  if (!isWhole(s.boostDays!, 1, 365)) return { error: "Öne Çıkar süresi 1 ile 365 gün arasında olmalı." };
  if (![s.portfolioImages!, s.portfolioImagesPro!, s.portfolioImagesPlus!].every((n) => isWhole(n, 1, 50))) {
    return { error: "Örnek iş görseli sınırları 1 ile 50 arasında olmalı." };
  }
  if (s.portfolioImagesPro! < s.portfolioImages! || s.portfolioImagesPlus! < s.portfolioImagesPro!) {
    return { error: "Görsel sınırları Ücretsiz ≤ Pro ≤ Pro Plus olmalı." };
  }
  if (!(Number.isFinite(s.commissionPercent) && s.commissionPercent! >= 0 && s.commissionPercent! <= 50)) {
    return { error: "Komisyon oranı %0 ile %50 arasında olmalı." };
  }
  if (!isWhole(s.founderLimit!, 0, 100_000)) return { error: "Kurucu kontenjanı 0 veya pozitif bir tam sayı olmalı." };
  if (!isPrice(s.corporateMinTopUpTl!) || s.corporateMinTopUpTl! < 1) {
    return { error: "En düşük bakiye yüklemesi 1 ile 1.000.000 TL arasında olmalı." };
  }
  if (!(Number.isFinite(s.corporateBonusPercent) && s.corporateBonusPercent! >= 0 && s.corporateBonusPercent! <= 50)) {
    return { error: "Bakiye bonusu %0 ile %50 arasında olmalı." };
  }

  s.proMonthlyTl = round2(s.proMonthlyTl!);
  s.plusMonthlyTl = round2(s.plusMonthlyTl!);
  s.yearlyDiscountPercent = round2(s.yearlyDiscountPercent!);
  s.plusBoostDiscountPercent = round2(s.plusBoostDiscountPercent!);
  s.boostPriceTl = round2(s.boostPriceTl!);
  s.commissionPercent = round2(s.commissionPercent!);
  s.corporateMinTopUpTl = round2(s.corporateMinTopUpTl!);
  s.corporateBonusPercent = round2(s.corporateBonusPercent!);

  await saveSettings(s);
  // Prices, limits and call-outs show up across the site.
  revalidatePath("/", "layout");
  return { saved: true };
}
