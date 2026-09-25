"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { assertMockPaymentAllowed } from "@/lib/paytr";
import { parsePeriod } from "@/lib/membership";
import { PurchaseTermsError, assertTermsAccepted } from "@/lib/purchase-terms";
import { corporatePlanState, findOrCreatePendingCorpPurchase, parseCorpPlan } from "@/lib/corporate-plans";
import {
  ProPurchaseError,
  markProPurchasePaid,
  notifyCorpBankTransfer,
  payCorpPlanWithBalance,
} from "@/lib/pro-purchase";

/** The bound plan/period arrive from the client, so they are checked again here. */
async function requireCompanyPlan(planSlug: string, periodSlug: string) {
  const plan = parseCorpPlan(planSlug);
  const period = parsePeriod(periodSlug);
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/kurumsal/paketler");
  if (!plan || !period || !(await corporatePlanState(user.id)).open) redirect("/panel/kurumsal/paketler");
  return { user, plan, period, back: `/panel/kurumsal/paketler/odeme?paket=${planSlug}&donem=${periodSlug}` };
}

export async function payCorpPlanWithBalanceAction(planSlug: string, periodSlug: string) {
  const { user, plan, period, back } = await requireCompanyPlan(planSlug, periodSlug);
  try {
    await payCorpPlanWithBalance(user.id, plan, period);
  } catch (error) {
    if (!(error instanceof ProPurchaseError) && !(error instanceof PurchaseTermsError)) throw error;
    redirect(`${back}&hata=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/panel", "layout");
  redirect("/panel/kurumsal/paketler?odendi=1");
}

export async function notifyCorpBankTransferAction(planSlug: string, periodSlug: string) {
  const { user, plan, period } = await requireCompanyPlan(planSlug, periodSlug);
  await notifyCorpBankTransfer(user.id, plan, period);
}

export async function completeMockCorpPayment(planSlug: string, periodSlug: string) {
  assertMockPaymentAllowed();
  const { user, plan, period } = await requireCompanyPlan(planSlug, periodSlug);
  const purchase = await findOrCreatePendingCorpPurchase(user.id, plan, period);
  assertTermsAccepted(purchase);
  await markProPurchasePaid(purchase.id);
  revalidatePath("/panel", "layout");
  redirect("/panel/kurumsal/paketler?odendi=1");
}

export async function failMockCorpPayment(planSlug: string, periodSlug: string) {
  assertMockPaymentAllowed();
  const { user, plan, period, back } = await requireCompanyPlan(planSlug, periodSlug);
  const purchase = await findOrCreatePendingCorpPurchase(user.id, plan, period);
  await prisma.proPurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
  redirect(`${back}&hata=odeme-basarisiz`);
}
