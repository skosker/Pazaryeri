import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import { sendCampaignAnnouncementEmails } from "@/lib/email";
import { unsubscribeOneClickUrl, unsubscribePageUrl } from "@/lib/email-preferences";

/** Who a campaign announcement goes to: real, active, verified freelancers who did not opt out. */
export const announcementAudience = {
  role: "FREELANCER",
  synthetic: false,
  suspended: false,
  emailVerified: { not: null },
  campaignEmails: true,
} as const;

const when = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

/**
 * E-mail the campaign to freelancers, once per campaign: the announcedAt claim goes first,
 * so a double submit or two admins at once cannot send it twice. Returns how many were
 * sent, or null when it had already been announced.
 */
export async function announceCampaign(campaignId: string): Promise<number | null> {
  const { count } = await prisma.campaign.updateMany({
    where: { id: campaignId, announcedAt: null },
    data: { announcedAt: new Date(), announcedCount: 0 },
  });
  if (count === 0) return null;

  const [campaign, recipients] = await Promise.all([
    prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } }),
    prisma.user.findMany({ where: announcementAudience, select: { id: true, email: true, name: true } }),
  ]);
  const sent = await sendCampaignAnnouncementEmails(
    {
      name: campaign.name,
      tagline: campaign.tagline,
      start: when.format(campaign.start),
      end: when.format(campaign.end),
      minPercent: campaign.minPercent,
      maxPercent: campaign.maxPercent,
      proDiscountPercent: campaign.proDiscountPercent,
      boostDiscountPercent: campaign.boostDiscountPercent,
      joinUrl: `${siteUrl}/panel/kampanyalar`,
    },
    recipients.map((r) => ({
      email: r.email,
      name: r.name,
      unsubscribeUrl: unsubscribePageUrl(r.id),
      oneClickUrl: unsubscribeOneClickUrl(r.id),
    }))
  );
  await prisma.campaign.update({ where: { id: campaignId }, data: { announcedCount: sent } });
  return sent;
}
