"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

/** A datetime-local value ("2026-11-23T00:00") read as Istanbul time; empty → null. */
function istanbulDateTime(value: FormDataEntryValue | null): Date | null {
  const v = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const date = new Date(`${v}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Ends every gig's campaign sign-up, e.g. before setting up the next campaign. */
export async function resetCampaignSignupsAction(): Promise<void> {
  await requireAdmin();
  await prisma.gig.updateMany({ where: { campaignPercent: { not: null } }, data: { campaignPercent: null } });
  revalidatePath("/", "layout");
}

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
    campaignEnabled: formData.get("campaignEnabled") === "on",
    campaignName: String(formData.get("campaignName") ?? "").trim(),
    campaignStart: istanbulDateTime(formData.get("campaignStart")),
    campaignEnd: istanbulDateTime(formData.get("campaignEnd")),
    campaignMinPercent: num(formData, "campaignMinPercent"),
    campaignMaxPercent: num(formData, "campaignMaxPercent"),
    corporateEnabled: formData.get("corporateEnabled") === "on",
    corporateMinTopUpTl: num(formData, "corporateMinTopUpTl"),
    corporateBonusPercent: num(formData, "corporateBonusPercent"),
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
  if (settings.campaignName.length < 2 || settings.campaignName.length > 60) {
    return { error: "Kampanya adı 2–60 karakter olmalı." };
  }
  if (!whole(settings.campaignMinPercent, 1, 90) || !whole(settings.campaignMaxPercent, 1, 90)) {
    return { error: "Kampanya indirim oranları %1 ile %90 arasında tam sayı olmalı." };
  }
  if (settings.campaignMinPercent > settings.campaignMaxPercent) {
    return { error: "Kampanyada en düşük indirim en yüksekten büyük olamaz." };
  }
  if (settings.campaignEnabled && (!settings.campaignStart || !settings.campaignEnd)) {
    return { error: "Kampanyayı açmak için başlangıç ve bitiş tarihini gir." };
  }
  if (settings.campaignStart && settings.campaignEnd && settings.campaignEnd <= settings.campaignStart) {
    return { error: "Kampanya bitişi başlangıçtan sonra olmalı." };
  }
  if (!price(settings.corporateMinTopUpTl) || settings.corporateMinTopUpTl < 1) {
    return { error: "En düşük bakiye yüklemesi 1 ile 1.000.000 ₺ arasında olmalı." };
  }
  if (!(Number.isFinite(settings.corporateBonusPercent) && settings.corporateBonusPercent >= 0 && settings.corporateBonusPercent <= 50)) {
    return { error: "Bakiye bonusu %0 ile %50 arasında olmalı." };
  }
  if (!price(settings.referralRewardTl)) return { error: "Davet ödülü 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!price(settings.firstOrderMaxTl)) return { error: "İlk sipariş indirimi üst sınırı 0 ile 1.000.000 ₺ arasında olmalı." };

  settings.proPriceTl = Math.round(settings.proPriceTl * 100) / 100;
  settings.boostPriceTl = Math.round(settings.boostPriceTl * 100) / 100;
  settings.commissionPercent = Math.round(settings.commissionPercent * 100) / 100;
  settings.firstOrderPercent = Math.round(settings.firstOrderPercent * 100) / 100;
  settings.firstOrderMaxTl = Math.round(settings.firstOrderMaxTl * 100) / 100;
  settings.referralRewardTl = Math.round(settings.referralRewardTl * 100) / 100;
  settings.corporateMinTopUpTl = Math.round(settings.corporateMinTopUpTl * 100) / 100;
  settings.corporateBonusPercent = Math.round(settings.corporateBonusPercent * 100) / 100;

  await saveSettings(settings);
  // Prices, limits and call-outs show up across the site.
  revalidatePath("/", "layout");
  return { saved: true };
}
