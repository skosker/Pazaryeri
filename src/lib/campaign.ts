import { getSettings } from "@/lib/settings";

/**
 * The seasonal campaign (e.g. Efsane Cuma), set up at /admin/ayarlar. Switched off it is
 * invisible to everyone but admins. Switched on, freelancers can sign gigs up until it
 * ends, and buyers see the discounts only between its start and end.
 */
export type Campaign = {
  enabled: boolean;
  name: string;
  start: Date | null;
  end: Date | null;
  minPercent: number;
  maxPercent: number;
  /** Buyers see discounted prices, badges and the campaign page. */
  live: boolean;
  /** Freelancers may join or leave with their gigs. */
  signupOpen: boolean;
};

export async function getCampaign(now = new Date()): Promise<Campaign> {
  const s = await getSettings();
  const started = s.campaignStart !== null && s.campaignStart <= now;
  const ended = s.campaignEnd !== null && s.campaignEnd <= now;
  return {
    enabled: s.campaignEnabled,
    name: s.campaignName,
    start: s.campaignStart,
    end: s.campaignEnd,
    minPercent: s.campaignMinPercent,
    maxPercent: s.campaignMaxPercent,
    live: s.campaignEnabled && started && s.campaignEnd !== null && !ended,
    signupOpen: s.campaignEnabled && !ended,
  };
}

/** The gig's campaign discount if it applies right now, else null. */
export function activeCampaignPercent(campaign: Campaign, gigPercent: number | null | undefined): number | null {
  return campaign.live && gigPercent ? gigPercent : null;
}

/** A campaign price, rounded to the whole lira. */
export function campaignPrice(price: number, percent: number | null): number {
  return percent ? Math.round((price * (100 - percent)) / 100) : price;
}
