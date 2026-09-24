"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { formNumber as num, isPrice, isWhole, round2 } from "@/app/admin/settings-fields";

export type FormState = { error?: string; saved?: boolean };

/** Always-on offers: first-order discount and the referral programme. */
export async function saveOfferSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const s: Partial<SiteSettings> = {
    firstOrderEnabled: formData.get("firstOrderEnabled") === "on",
    firstOrderPercent: num(formData, "firstOrderPercent"),
    firstOrderMaxTl: num(formData, "firstOrderMaxTl"),
    referralEnabled: formData.get("referralEnabled") === "on",
    referralRewardTl: num(formData, "referralRewardTl"),
  };
  if (!(Number.isFinite(s.firstOrderPercent) && s.firstOrderPercent! >= 0 && s.firstOrderPercent! <= 90)) {
    return { error: "İlk sipariş indirimi %0 ile %90 arasında olmalı." };
  }
  if (!isPrice(s.firstOrderMaxTl!)) return { error: "İlk sipariş indirimi üst sınırı 0 ile 1.000.000 ₺ arasında olmalı." };
  if (!isPrice(s.referralRewardTl!)) return { error: "Davet ödülü 0 ile 1.000.000 ₺ arasında olmalı." };
  s.firstOrderPercent = round2(s.firstOrderPercent!);
  s.firstOrderMaxTl = round2(s.firstOrderMaxTl!);
  s.referralRewardTl = round2(s.referralRewardTl!);
  await saveSettings(s);
  revalidatePath("/", "layout");
  return { saved: true };
}

/** A datetime-local value ("2026-11-23T00:00") read as Istanbul time; anything else → null. */
function istanbulDateTime(value: FormDataEntryValue | null): Date | null {
  const v = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const date = new Date(`${v}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Create (id null) or update a seasonal campaign. */
export async function saveCampaignAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    enabled: formData.get("enabled") === "on",
    start: istanbulDateTime(formData.get("start")),
    end: istanbulDateTime(formData.get("end")),
    minPercent: num(formData, "minPercent"),
    maxPercent: num(formData, "maxPercent"),
    proDiscountPercent: num(formData, "proDiscountPercent"),
    boostDiscountPercent: num(formData, "boostDiscountPercent"),
  };

  if (data.name.length < 2 || data.name.length > 60) return { error: "Kampanya adı 2–60 karakter olmalı." };
  if (data.tagline && data.tagline.length > 160) return { error: "Kısa açıklama en fazla 160 karakter olmalı." };
  if (!data.start || !data.end) return { error: "Başlangıç ve bitiş tarihini gir." };
  if (data.end <= data.start) return { error: "Bitiş, başlangıçtan sonra olmalı." };
  if (!isWhole(data.minPercent, 1, 90) || !isWhole(data.maxPercent, 1, 90)) {
    return { error: "İlan indirim aralığı %1 ile %90 arasında tam sayı olmalı." };
  }
  if (data.minPercent > data.maxPercent) return { error: "En düşük indirim en yüksekten büyük olamaz." };
  if (!isWhole(data.proDiscountPercent, 0, 100) || !isWhole(data.boostDiscountPercent, 0, 100)) {
    return { error: "Pro ve Öne Çıkar indirimleri %0 ile %100 arasında tam sayı olmalı." };
  }

  // Two switched-on campaigns must not overlap: buyers see one campaign at a time.
  if (data.enabled) {
    const clash = await prisma.campaign.findFirst({
      where: { enabled: true, start: { lt: data.end }, end: { gt: data.start }, ...(id ? { id: { not: id } } : {}) },
      select: { name: true },
    });
    if (clash) return { error: `Bu tarihler açık olan “${clash.name}” kampanyasıyla çakışıyor.` };
  }

  const saved = id
    ? await prisma.campaign.update({ where: { id }, data: { ...data, start: data.start, end: data.end } })
    : await prisma.campaign.create({ data: { ...data, start: data.start, end: data.end } });

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/kampanyalar/${saved.id}?kaydedildi=1`);
  return { saved: true };
}

export async function deleteCampaignAction(id: string) {
  await requireAdmin();
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/kampanyalar");
}

export async function resetCampaignEntriesAction(id: string) {
  await requireAdmin();
  await prisma.campaignEntry.deleteMany({ where: { campaignId: id } });
  revalidatePath("/", "layout");
}
