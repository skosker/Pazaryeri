import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Seasonal campaigns (Freelancer Günü, Efsane Cuma…), managed at /admin/kampanyalar.
 * Switched off, a campaign is invisible to everyone but admins. Switched on, freelancers
 * can sign gigs up until it ends; buyers see the discounts only between start and end.
 * Enabled campaigns are kept from overlapping, so at most one is live at a time.
 */
export type CampaignRow = {
  id: string;
  name: string;
  tagline: string | null;
  enabled: boolean;
  start: Date;
  end: Date;
  minPercent: number;
  maxPercent: number;
  proDiscountPercent: number;
  boostDiscountPercent: number;
};

export type CampaignStatus = "kapali" | "yakinda" | "yayinda" | "bitti";

export function campaignStatus(c: Pick<CampaignRow, "enabled" | "start" | "end">, now = new Date()): CampaignStatus {
  if (!c.enabled) return "kapali";
  if (c.end <= now) return "bitti";
  if (c.start <= now) return "yayinda";
  return "yakinda";
}

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  kapali: "Kapalı",
  yakinda: "Yakında (katılım açık)",
  yayinda: "Yayında",
  bitti: "Bitti",
};

/** Every campaign, oldest start first — a handful of rows, read once per request. */
export const getCampaigns = cache(async (): Promise<CampaignRow[]> => {
  return prisma.campaign.findMany({ orderBy: { start: "asc" } });
});

/** The campaign buyers see right now, if any. */
export async function getLiveCampaign(now = new Date()): Promise<CampaignRow | null> {
  return (await getCampaigns()).find((c) => campaignStatus(c, now) === "yayinda") ?? null;
}

/** Campaigns freelancers can join or leave right now (switched on and not over). */
export async function getOpenCampaigns(now = new Date()): Promise<CampaignRow[]> {
  return (await getCampaigns()).filter((c) => {
    const status = campaignStatus(c, now);
    return status === "yakinda" || status === "yayinda";
  });
}

/**
 * What pricing needs: the campaign shown as live (the real one, or one an admin is
 * previewing) and each joined gig's discount.
 */
export type CampaignPricing = { campaign: CampaignRow | null; percents: Map<string, number> };

async function pricingFor(campaign: CampaignRow | null): Promise<CampaignPricing> {
  if (!campaign) return { campaign: null, percents: new Map() };
  const entries = await prisma.campaignEntry.findMany({
    where: { campaignId: campaign.id },
    select: { gigId: true, percent: true },
  });
  return { campaign, percents: new Map(entries.map((e) => [e.gigId, e.percent])) };
}

/** Live pricing, once per request. */
export const getCampaignPricing = cache(async (): Promise<CampaignPricing> => pricingFor(await getLiveCampaign()));

/** Pricing as if `campaignId` were live — for an admin's preview of the campaign page. */
export async function previewCampaignPricing(campaignId: string): Promise<CampaignPricing> {
  const campaign = (await getCampaigns()).find((c) => c.id === campaignId) ?? null;
  return pricingFor(campaign);
}

/** The gig's campaign discount if one applies, else null. */
export function activeCampaignPercent(pricing: CampaignPricing, gigId: string): number | null {
  return pricing.campaign ? (pricing.percents.get(gigId) ?? null) : null;
}

/** A campaign price, rounded to the whole lira. */
export function campaignPrice(price: number, percent: number | null): number {
  return percent ? Math.round((price * (100 - percent)) / 100) : price;
}

/** Freelancer perks while a campaign is live: Pro and "Öne Çıkar" at a discount. */
export async function livePerkPercents(): Promise<{ pro: number; boost: number; name: string | null }> {
  const live = await getLiveCampaign();
  return { pro: live?.proDiscountPercent ?? 0, boost: live?.boostDiscountPercent ?? 0, name: live?.name ?? null };
}
