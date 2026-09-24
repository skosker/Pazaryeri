"use server";

import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { getOpenCampaigns } from "@/lib/campaign";

async function ownApprovedGig(gigId: string) {
  const user = await activeUser();
  if (!user) return null;
  const gig = await prisma.gig.findUnique({ where: { id: gigId }, select: { sellerId: true, status: true } });
  if (!gig || gig.sellerId !== user.id || gig.status !== "APPROVED") return null;
  return gig;
}

/** Join an open campaign with one of your approved gigs, or change its discount. */
export async function joinCampaignAction(campaignId: string, gigId: string, formData: FormData) {
  if (!(await ownApprovedGig(gigId))) return;
  const campaign = (await getOpenCampaigns()).find((c) => c.id === campaignId);
  if (!campaign) return;
  const percent = Number(formData.get("percent"));
  if (!Number.isInteger(percent) || percent < campaign.minPercent || percent > campaign.maxPercent) return;
  await prisma.campaignEntry.upsert({
    where: { campaignId_gigId: { campaignId, gigId } },
    create: { campaignId, gigId, percent },
    update: { percent },
  });
  revalidatePath("/", "layout");
}

export async function leaveCampaignAction(campaignId: string, gigId: string) {
  if (!(await ownApprovedGig(gigId))) return;
  await prisma.campaignEntry.deleteMany({ where: { campaignId, gigId } });
  revalidatePath("/", "layout");
}
