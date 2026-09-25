"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EMAIL_KIND_FIELD, type EmailKind, verifyUnsubscribeToken } from "@/lib/email-preferences";

export async function unsubscribeAction(userId: string, token: string, kind: EmailKind) {
  if (!verifyUnsubscribeToken(userId, token, kind)) redirect("/eposta-tercihi");
  await prisma.user.updateMany({ where: { id: userId }, data: { [EMAIL_KIND_FIELD[kind]]: false } });
  const tur = kind === "kampanya" ? "" : `&tur=${kind}`;
  redirect(`/eposta-tercihi?u=${encodeURIComponent(userId)}&t=${token}${tur}&tamam=1`);
}
