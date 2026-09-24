"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { assertMockPaymentAllowed } from "@/lib/paytr";
import { parsePeriod, parsePlan } from "@/lib/membership";
import {
  findOrCreatePendingProPurchase,
  markProPurchasePaid,
  notifyProBankTransfer,
} from "@/lib/pro-purchase";

/** The bound plan/period arrive from the client, so they are checked again here. */
async function requireFreelancerPlan(planSlug: string, periodSlug: string) {
  const plan = parsePlan(planSlug);
  const period = parsePeriod(periodSlug);
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol");
  if (user.role !== "FREELANCER" || !plan || !period) redirect("/panel/pro-ol");
  return { user, plan, period };
}

export async function completeMockProPayment(planSlug: string, periodSlug: string) {
  assertMockPaymentAllowed();
  const { user, plan, period } = await requireFreelancerPlan(planSlug, periodSlug);

  const purchase = await findOrCreatePendingProPurchase(user.id, plan, period);
  await markProPurchasePaid(purchase.id);

  revalidatePath("/", "layout");
  redirect("/panel/pro-ol?odendi=1");
}

export async function failMockProPayment(planSlug: string, periodSlug: string) {
  assertMockPaymentAllowed();
  const { user, plan, period } = await requireFreelancerPlan(planSlug, periodSlug);

  const purchase = await findOrCreatePendingProPurchase(user.id, plan, period);
  await prisma.proPurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });

  redirect(`/panel/pro-ol/odeme?paket=${planSlug}&donem=${periodSlug}&hata=odeme-basarisiz`);
}

export async function notifyProBankTransferAction(planSlug: string, periodSlug: string) {
  const { user, plan, period } = await requireFreelancerPlan(planSlug, periodSlug);
  await notifyProBankTransfer(user.id, plan, period);
}
