"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import {
  MAX_TEST_ACCOUNTS,
  TEST_EMAIL_DOMAIN,
  emailLocalPart,
  generatePassword,
  isBulkTestEmail,
  parseNames,
} from "@/lib/test-accounts";
import { PERIOD_MONTHS, parsePeriod } from "@/lib/membership";
import { markProPurchasePaid, membershipQuote } from "@/lib/pro-purchase";
import { createOrder, refreshOrderDiscounts } from "@/lib/orders";
import { markOrderPaid } from "@/lib/order-actions";
import { createLoginToken } from "@/lib/login-tokens";
import { parseTlAmount } from "@/lib/refund-labels";
import { createSampleRefundRequests } from "@/lib/test-refunds";
import { getSettings } from "@/lib/settings";
import { corpPlanPrice, corpPlansOpen } from "@/lib/corporate-plans";
import { isValidTaxNumber } from "@/lib/tax-number";

export type CreatedAccount = { name: string; email: string; password: string };
export type TestAccountsState = {
  error?: string;
  created?: CreatedAccount[];
  existing?: { name: string; email: string }[];
};

/**
 * Opens a test account (buyer, isTester, already verified) for every name in the list,
 * as ad.soyad@test.prosinta.com — a number is added when that address is taken. Sending
 * the same list again does not open a second set: a test account with the same name on
 * that domain is reported back with its password left as it was.
 */
export async function createTestAccountsAction(
  _prev: TestAccountsState,
  formData: FormData
): Promise<TestAccountsState> {
  await requireAdmin();
  const names = parseNames(String(formData.get("names") ?? ""));
  if (names.length === 0) return { error: "En az bir ad soyad gir (her satıra bir kişi)." };
  if (names.length > MAX_TEST_ACCOUNTS) return { error: `Tek seferde en çok ${MAX_TEST_ACCOUNTS} hesap açılabilir.` };
  if (names.some((name) => name.length > 80)) return { error: "Ad soyad 80 karakteri geçemez." };

  const created: CreatedAccount[] = [];
  const existing: { name: string; email: string }[] = [];
  for (const name of names) {
    const base = emailLocalPart(name) || "test";
    const already = await prisma.user.findFirst({
      where: { name, isTester: true, email: { startsWith: base, endsWith: `@${TEST_EMAIL_DOMAIN}` } },
      select: { email: true },
    });
    if (already) {
      existing.push({ name, email: already.email });
      continue;
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    for (let n = 1; n < 100; n++) {
      const email = `${base}${n === 1 ? "" : n}@${TEST_EMAIL_DOMAIN}`;
      if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) continue;
      try {
        await prisma.user.create({
          data: { name, email, passwordHash, role: "BUYER", isTester: true, emailVerified: new Date() },
        });
        created.push({ name, email, password });
        break;
      } catch (error) {
        // Taken between the check and the insert: try the next number.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
        throw error;
      }
    }
  }

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/kullanicilar/test-hesaplari");
  return { created, existing };
}

/**
 * A new password for a bulk-opened test account. Its address has no mailbox, so
 * "Şifremi unuttum" cannot reach it; the admin hands this one out instead.
 */
export async function resetTestPasswordAction(userId: string): Promise<{ password?: string; error?: string }> {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isTester: true, email: true } });
  if (!user?.isTester || !isBulkTestEmail(user.email)) {
    return { error: "Yalnızca toplu açılan test hesaplarında kullanılabilir." };
  }
  const password = generatePassword();
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  return { password };
}

export type TestTransfersState = { error?: string; created?: number; skipped?: string[] };

/**
 * Pending Pro / Pro Plus bank-transfer notices for the chosen test accounts, so Havale/EFT
 * Onayları has something to approve without each tester going through checkout. Priced
 * like a real purchase today; an account that is still a buyer is made a freelancer
 * first (only freelancers buy Pro), and one already waiting on a notice is skipped. The
 * consent field stays empty: nobody ticked the agreement for these.
 */
export async function createTestTransfersAction(
  _prev: TestTransfersState,
  formData: FormData
): Promise<TestTransfersState> {
  await requireAdmin();
  const ids = formData.getAll("userId").map(String);
  const plan = formData.get("plan") === "PRO_PLUS" ? "PRO_PLUS" : formData.get("plan") === "PRO" ? "PRO" : null;
  const period = parsePeriod(formData.get("period"));
  if (ids.length === 0) return { error: "En az bir test hesabı seç." };
  if (!plan || !period) return { error: "Paket ve süreyi seç." };

  const users = await prisma.user.findMany({
    where: { id: { in: ids }, isTester: true },
    select: { id: true, name: true, role: true },
  });
  const { amount } = await membershipQuote(plan, period);
  let created = 0;
  const skipped: string[] = [];
  for (const u of users) {
    const waiting = await prisma.proPurchase.count({
      where: { userId: u.id, provider: "havale", status: "INITIALIZED", plan: { in: ["PRO", "PRO_PLUS"] } },
    });
    if (waiting > 0) {
      skipped.push(u.name);
      continue;
    }
    if (u.role === "BUYER") await prisma.user.update({ where: { id: u.id }, data: { role: "FREELANCER" } });
    await prisma.proPurchase.create({
      data: { userId: u.id, plan, months: PERIOD_MONTHS[period], amount, provider: "havale" },
    });
    created++;
  }

  revalidatePath("/admin/havale-onaylari");
  revalidatePath("/admin/kullanicilar/test-hesaplari");
  return { created, skipped };
}

/** A one-time sign-in link (path only) for a bulk-opened test account. */
export async function createLoginLinkAction(userId: string): Promise<{ path?: string; error?: string }> {
  const admin = await requireAdmin();
  const token = await createLoginToken(userId, admin.id);
  if (!token) return { error: "Bu hesap için link oluşturulamaz (test hesabı değil ya da askıda)." };
  return { path: `/test-giris?t=${token}` };
}

export type BulkLoginLink = { name: string; email: string; path: string };

/** Fresh one-time links for every active bulk-opened test account at once. */
export async function createAllLoginLinksAction(): Promise<{ links: BulkLoginLink[]; expiresAt: string }> {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    where: { isTester: true, suspended: false, email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  const links: BulkLoginLink[] = [];
  for (const u of users) {
    const token = await createLoginToken(u.id, admin.id);
    if (token) links.push({ name: u.name, email: u.email, path: `/test-giris?t=${token}` });
  }
  return { links, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
}

export type TestPriceGroup = { price: number; gigs: { title: string; slug: string }[] };
export type TestPricesState = { error?: string; groups?: TestPriceGroup[] };

/**
 * Showcase gigs at given starting prices, for test orders at those amounts. Only gigs of
 * generated (synthetic) sellers are touched, never a real freelancer's. For each price,
 * gigs already starting there count first; the rest are repriced so their cheapest
 * package is exactly that price and the others keep their ratio to it (rounded to 50 TL).
 */
export async function setTestPricesAction(_prev: TestPricesState, formData: FormData): Promise<TestPricesState> {
  await requireAdmin();
  const prices = String(formData.get("prices") ?? "")
    .split(/[;\s]+/)
    .filter(Boolean)
    .map(parseTlAmount);
  const count = Number(formData.get("count"));
  if (prices.length === 0 || prices.length > 5 || prices.some((p) => !(p >= 50 && p <= 1_000_000))) {
    return { error: "1 ile 5 arasında fiyat gir (50 – 1.000.000 TL), boşlukla ayır: 2000 3000 78000" };
  }
  if (!(count >= 1 && count <= 10)) return { error: "Her fiyattan 1 ile 10 arasında ilan seçilebilir." };

  const gigs = await prisma.gig.findMany({
    where: { published: true, seller: { synthetic: true, suspended: false } },
    select: { id: true, title: true, slug: true, packages: { where: { tier: { not: "CUSTOM" } }, select: { id: true, price: true } } },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  const minOf = (g: (typeof gigs)[number]) => Math.min(...g.packages.map((p) => Number(p.price)));
  const pool = gigs.filter((g) => g.packages.length > 0);
  const used = new Set<string>();
  const groups: TestPriceGroup[] = [];

  for (const price of prices) {
    const already = pool.filter((g) => !used.has(g.id) && minOf(g) === price).slice(0, count);
    const picked = [...already];
    for (const g of pool) {
      if (picked.length >= count) break;
      if (used.has(g.id) || picked.includes(g)) continue;
      const factor = price / minOf(g);
      await prisma.$transaction(
        g.packages.map((p) => {
          const isMin = Number(p.price) === minOf(g);
          const next = isMin ? price : Math.max(price, Math.round((Number(p.price) * factor) / 50) * 50);
          return prisma.package.update({ where: { id: p.id }, data: { price: next } });
        })
      );
      picked.push(g);
    }
    picked.forEach((g) => used.add(g.id));
    groups.push({ price, gigs: picked.map((g) => ({ title: g.title, slug: g.slug })) });
  }

  revalidatePath("/kategoriler");
  revalidatePath("/");
  for (const g of groups) for (const x of g.gigs) revalidatePath(`/gig/${x.slug}`);
  return { groups };
}

export type SampleDataState = {
  error?: string;
  done?: { accounts: number; paidMemberships: number; pendingMemberships: number; pendingOrders: number; paidOrders: number; skipped: number };
};

/**
 * Example records for every active test account, made through the site's own order and
 * payment code so every screen shows them as it would a member's: by turns a paid Pro Plus
 * (aylık), a paid Pro (yıllık) or a Pro Plus bank transfer still waiting for approval, and
 * two orders on showcase gigs — one waiting for transfer approval, one paid. An account
 * that already has a membership purchase or an order is left alone, so pressing it again
 * adds nothing twice. Test accounts stay out of revenue; mail to them is not sent.
 */
export async function createSampleDataAction(): Promise<SampleDataState> {
  await requireAdmin();
  const accounts = await prisma.user.findMany({
    where: { isTester: true, suspended: false, email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: {
      id: true,
      role: true,
      _count: { select: { ordersMade: true, proPurchases: { where: { plan: { in: ["PRO", "PRO_PLUS"] }, status: { not: "FAILED" } } } } },
    },
    orderBy: { name: "asc" },
  });
  const gigs = await prisma.gig.findMany({
    where: { published: true, seller: { synthetic: true, suspended: false } },
    select: { packages: { where: { tier: { not: "CUSTOM" } }, orderBy: { price: "asc" }, take: 1, select: { id: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  const packages = gigs.map((g) => g.packages[0]?.id).filter((id): id is string => Boolean(id));
  if (packages.length < 2) return { error: "Örnek sipariş için yayında vitrin ilanı yok." };

  const done = { accounts: accounts.length, paidMemberships: 0, pendingMemberships: 0, pendingOrders: 0, paidOrders: 0, skipped: 0 };
  const plans = [
    { plan: "PRO_PLUS", period: "aylik", paid: true },
    { plan: "PRO", period: "yillik", paid: true },
    { plan: "PRO_PLUS", period: "aylik", paid: false },
  ] as const;
  let next = 0;

  for (const [i, u] of accounts.entries()) {
    if (u._count.proPurchases > 0 && u._count.ordersMade > 0) {
      done.skipped++;
      continue;
    }
    if (u._count.proPurchases === 0) {
      const { plan, period, paid } = plans[i % plans.length];
      if (u.role === "BUYER") await prisma.user.update({ where: { id: u.id }, data: { role: "FREELANCER" } });
      const { amount } = await membershipQuote(plan, period);
      const purchase = await prisma.proPurchase.create({
        data: { userId: u.id, plan, months: PERIOD_MONTHS[period], amount, provider: "havale" },
      });
      if (paid) {
        await markProPurchasePaid(purchase.id);
        done.paidMemberships++;
      } else {
        done.pendingMemberships++;
      }
    }
    if (u._count.ordersMade === 0) {
      for (const paid of [false, true]) {
        const order = await createOrder(u.id, packages[next++ % packages.length]);
        await refreshOrderDiscounts(order);
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: "havale",
            status: paid ? "SUCCESS" : "INITIALIZED",
            conversationId: randomUUID(),
            rawResponse: { mode: "havale", notifiedAt: new Date().toISOString(), sample: true },
          },
        });
        await prisma.order.update({ where: { id: order.id }, data: { status: "PENDING_VERIFICATION" } });
        if (paid) {
          await markOrderPaid(order.id);
          done.paidOrders++;
        } else {
          done.pendingOrders++;
        }
      }
    }
  }

  revalidatePath("/admin/havale-onaylari");
  revalidatePath("/admin/faturalar");
  revalidatePath("/admin/siparisler");
  revalidatePath("/admin/kullanicilar/test-hesaplari");
  return { done };
}

/** Example refund requests for every paid test membership that has none yet. */
export async function createSampleRefundsAction(): Promise<{ created: number }> {
  await requireAdmin();
  const result = await createSampleRefundRequests();
  revalidatePath("/admin/iadeler");
  revalidatePath("/admin/faturalar");
  revalidatePath("/panel/faturalarim");
  return result;
}

export type TestCorporateState = { error?: string; created?: number; skipped?: string[]; plansClosed?: boolean };

/** A made-up but checksum-valid VKN for a test company (the 10th digit is the check digit). */
function testTaxNumber(seed: number): string {
  const base = String(1000000000 + seed * 7919).slice(0, 9);
  for (let d = 0; d < 10; d++) if (isValidTaxNumber(base + d)) return base + d;
  return base + "0";
}

/**
 * Kurumsal / Kurumsal Plus packages for the chosen test accounts, as buyers: each is made
 * a buyer with a test company (name, vergi dairesi, valid-looking VKN, address) if it has
 * none, then gets the package either paid (the plan opens and the sale lands in Faturalar)
 * or as a bank-transfer notice waiting in Havale/EFT Onayları. An account that already
 * has a corporate purchase is skipped.
 */
export async function createTestCorporateAction(
  _prev: TestCorporateState,
  formData: FormData
): Promise<TestCorporateState> {
  await requireAdmin();
  const ids = formData.getAll("userId").map(String);
  const plan = formData.get("plan") === "KURUMSAL_PLUS" ? "KURUMSAL_PLUS" : formData.get("plan") === "KURUMSAL" ? "KURUMSAL" : null;
  const period = parsePeriod(formData.get("period"));
  const paid = formData.get("state") === "paid";
  if (ids.length === 0) return { error: "En az bir test hesabı seç." };
  if (!plan || !period) return { error: "Paket ve süreyi seç." };

  const settings = await getSettings();
  const amount = corpPlanPrice(plan, period, settings).total;
  const users = await prisma.user.findMany({
    where: { id: { in: ids }, isTester: true },
    select: { id: true, name: true, companyName: true, _count: { select: { proPurchases: { where: { plan: { in: ["KURUMSAL", "KURUMSAL_PLUS"] }, status: { not: "FAILED" } } } } } },
  });
  let created = 0;
  const skipped: string[] = [];
  for (const [i, u] of users.entries()) {
    if (u._count.proPurchases > 0) {
      skipped.push(u.name);
      continue;
    }
    await prisma.user.update({
      where: { id: u.id },
      data: {
        role: "BUYER",
        ...(u.companyName
          ? {}
          : {
              companyName: `${u.name} Test Şirketi A.Ş.`,
              taxOffice: "Kadıköy Vergi Dairesi",
              taxNumber: testTaxNumber(i + 1 + Math.floor(Date.now() / 1000) % 1000),
              billingAddress: "Örnek Mah. Test Sk. No: 1",
              billingCity: "İstanbul",
              billingDistrict: "Kadıköy",
            }),
      },
    });
    const purchase = await prisma.proPurchase.create({
      data: { userId: u.id, plan, months: PERIOD_MONTHS[period], amount, provider: "havale" },
    });
    if (paid) await markProPurchasePaid(purchase.id);
    created++;
  }

  revalidatePath("/admin/havale-onaylari");
  revalidatePath("/admin/faturalar");
  revalidatePath("/admin/kurumsal");
  revalidatePath("/admin/kullanicilar/test-hesaplari");
  return { created, skipped, plansClosed: !corpPlansOpen(settings) };
}
