"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email-preferences";

export async function unsubscribeAction(userId: string, token: string) {
  if (!verifyUnsubscribeToken(userId, token)) redirect("/eposta-tercihi");
  await prisma.user.updateMany({ where: { id: userId }, data: { campaignEmails: false } });
  redirect(`/eposta-tercihi?u=${encodeURIComponent(userId)}&t=${token}&tamam=1`);
}
