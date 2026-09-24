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
    proPriceTl: num(formData, "proPriceTl"),
    portfolioImages: num(formData, "portfolioImages"),
    portfolioImagesPro: num(formData, "portfolioImagesPro"),
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

  if (!isPrice(s.proPriceTl!)) return { error: "Pro fiyatı 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!isPrice(s.boostPriceTl!)) return { error: "Öne Çıkar fiyatı 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!isWhole(s.boostDays!, 1, 365)) return { error: "Öne Çıkar süresi 1 ile 365 gün arasında olmalı." };
  if (!isWhole(s.portfolioImages!, 1, 50) || !isWhole(s.portfolioImagesPro!, 1, 50)) {
    return { error: "Örnek iş görseli sınırları 1 ile 50 arasında olmalı." };
  }
  if (s.portfolioImagesPro! < s.portfolioImages!) return { error: "Pro görsel sınırı normal sınırdan düşük olamaz." };
  if (!(Number.isFinite(s.commissionPercent) && s.commissionPercent! >= 0 && s.commissionPercent! <= 50)) {
    return { error: "Komisyon oranı %0 ile %50 arasında olmalı." };
  }
  if (!isWhole(s.founderLimit!, 0, 100_000)) return { error: "Kurucu kontenjanı 0 veya pozitif bir tam sayı olmalı." };
  if (!isPrice(s.corporateMinTopUpTl!) || s.corporateMinTopUpTl! < 1) {
    return { error: "En düşük bakiye yüklemesi 1 ile 1.000.000 ₺ arasında olmalı." };
  }
  if (!(Number.isFinite(s.corporateBonusPercent) && s.corporateBonusPercent! >= 0 && s.corporateBonusPercent! <= 50)) {
    return { error: "Bakiye bonusu %0 ile %50 arasında olmalı." };
  }

  s.proPriceTl = round2(s.proPriceTl!);
  s.boostPriceTl = round2(s.boostPriceTl!);
  s.commissionPercent = round2(s.commissionPercent!);
  s.corporateMinTopUpTl = round2(s.corporateMinTopUpTl!);
  s.corporateBonusPercent = round2(s.corporateBonusPercent!);

  await saveSettings(s);
  // Prices, limits and call-outs show up across the site.
  revalidatePath("/", "layout");
  return { saved: true };
}
