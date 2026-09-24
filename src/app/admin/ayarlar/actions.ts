"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { saveSettings, type SiteSettings } from "@/lib/settings";

export type SettingsFormState = { error?: string; saved?: boolean };

function num(formData: FormData, key: string): number {
  // Accept Turkish decimals ("2,5") as well as "2.5".
  return Number(String(formData.get(key) ?? "").trim().replace(",", "."));
}

export async function saveSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const settings: SiteSettings = {
    proPriceTl: num(formData, "proPriceTl"),
    portfolioImages: num(formData, "portfolioImages"),
    portfolioImagesPro: num(formData, "portfolioImagesPro"),
    boostEnabled: formData.get("boostEnabled") === "on",
    boostPriceTl: num(formData, "boostPriceTl"),
    boostDays: num(formData, "boostDays"),
    commissionPercent: num(formData, "commissionPercent"),
    founderEnabled: formData.get("founderEnabled") === "on",
    founderLimit: num(formData, "founderLimit"),
    firstOrderEnabled: formData.get("firstOrderEnabled") === "on",
    firstOrderPercent: num(formData, "firstOrderPercent"),
    firstOrderMaxTl: num(formData, "firstOrderMaxTl"),
    referralEnabled: formData.get("referralEnabled") === "on",
    referralRewardTl: num(formData, "referralRewardTl"),
  };

  const price = (v: number) => Number.isFinite(v) && v >= 0 && v <= 1_000_000;
  const whole = (v: number, min: number, max: number) => Number.isInteger(v) && v >= min && v <= max;

  if (!price(settings.proPriceTl)) return { error: "Pro fiyatı 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!price(settings.boostPriceTl)) return { error: "Öne Çıkar fiyatı 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!whole(settings.boostDays, 1, 365)) return { error: "Öne Çıkar süresi 1 ile 365 gün arasında olmalı." };
  if (!whole(settings.portfolioImages, 1, 50) || !whole(settings.portfolioImagesPro, 1, 50)) {
    return { error: "Örnek iş görseli sınırları 1 ile 50 arasında olmalı." };
  }
  if (settings.portfolioImagesPro < settings.portfolioImages) {
    return { error: "Pro görsel sınırı normal sınırdan düşük olamaz." };
  }
  if (!(Number.isFinite(settings.commissionPercent) && settings.commissionPercent >= 0 && settings.commissionPercent <= 50)) {
    return { error: "Komisyon oranı %0 ile %50 arasında olmalı." };
  }
  if (!whole(settings.founderLimit, 0, 100_000)) return { error: "Kurucu kontenjanı 0 veya pozitif bir tam sayı olmalı." };
  if (!(Number.isFinite(settings.firstOrderPercent) && settings.firstOrderPercent >= 0 && settings.firstOrderPercent <= 90)) {
    return { error: "İlk sipariş indirimi %0 ile %90 arasında olmalı." };
  }
  if (!price(settings.referralRewardTl)) return { error: "Davet ödülü 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!price(settings.firstOrderMaxTl)) return { error: "İlk sipariş indirimi üst sınırı 0 ile 1.000.000 ₺ arasında olmalı." };

  settings.proPriceTl = Math.round(settings.proPriceTl * 100) / 100;
  settings.boostPriceTl = Math.round(settings.boostPriceTl * 100) / 100;
  settings.commissionPercent = Math.round(settings.commissionPercent * 100) / 100;
  settings.firstOrderPercent = Math.round(settings.firstOrderPercent * 100) / 100;
  settings.firstOrderMaxTl = Math.round(settings.firstOrderMaxTl * 100) / 100;
  settings.referralRewardTl = Math.round(settings.referralRewardTl * 100) / 100;

  await saveSettings(settings);
  // Prices, limits and call-outs show up across the site.
  revalidatePath("/", "layout");
  return { saved: true };
}
