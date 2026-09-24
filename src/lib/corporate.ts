import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { markOrderPaid } from "@/lib/order-actions";
import { payableAmount, refreshOrderDiscounts, sellerTakesOrders } from "@/lib/orders";
import { corpPerks, corpPlanSelect, corpTier } from "@/lib/corporate-plans";

export class CorporateError extends Error {}

/**
 * The corporate package (bulk balance, pay orders from it), switched on at /admin/ayarlar.
 * Only a corporate account — one with company billing details — can use it.
 */
export async function corporateAccount(userId: string) {
  const [settings, user] = await Promise.all([
    getSettings(),
    prisma.user.findUnique({ where: { id: userId }, select: { companyName: true, balance: true, ...corpPlanSelect } }),
  ]);
  // A corporate plan's top-up bonus replaces the general one when it is higher.
  const planBonus = user ? corpPerks(corpTier(user, settings), settings).bonusPercent : 0;
  return {
    enabled: settings.corporateEnabled,
    isCorporate: Boolean(user?.companyName),
    usable: settings.corporateEnabled && Boolean(user?.companyName),
    companyName: user?.companyName ?? null,
    balance: Number(user?.balance ?? 0),
    minTopUp: settings.corporateMinTopUpTl,
    bonusPercent: Math.max(settings.corporateBonusPercent, planBonus),
  };
}

/** A bank-transfer top-up the company says it sent; the bonus is fixed at request time. */
export async function requestTopUp(userId: string, amount: number) {
  const account = await corporateAccount(userId);
  if (!account.usable) throw new CorporateError("Kurumsal paket kullanılamıyor.");
  if (!Number.isFinite(amount) || amount < account.minTopUp || amount > 10_000_000) {
    throw new CorporateError(`En az ${account.minTopUp.toLocaleString("tr-TR")} TL yükleyebilirsin.`);
  }
  const rounded = Math.round(amount * 100) / 100;
  const bonus = Math.round(rounded * account.bonusPercent) / 100;
  return prisma.balanceTopUp.create({ data: { userId, amount: rounded, bonus } });
}

/** Admin: the money is in — credit amount + bonus. Safe to click twice. */
export async function confirmTopUp(topUpId: string) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.balanceTopUp.updateMany({
      where: { id: topUpId, status: "INITIALIZED" },
      data: { status: "SUCCESS", confirmedAt: new Date() },
    });
    if (count === 0) return;
    const topUp = await tx.balanceTopUp.findUniqueOrThrow({ where: { id: topUpId } });
    const credit = Number(topUp.amount) + Number(topUp.bonus);
    await tx.user.update({ where: { id: topUp.userId }, data: { balance: { increment: credit } } });
    await tx.balanceEntry.create({
      data: {
        userId: topUp.userId,
        kind: "TOPUP",
        amount: credit,
        topUpId,
        note: Number(topUp.bonus) > 0 ? `Havale/EFT yükleme (+${Number(topUp.bonus).toLocaleString("tr-TR")} TL bonus)` : "Havale/EFT yükleme",
      },
    });
  });
}

export async function rejectTopUp(topUpId: string) {
  await prisma.balanceTopUp.updateMany({ where: { id: topUpId, status: "INITIALIZED" }, data: { status: "FAILED" } });
}

/**
 * Pay an unpaid order from the corporate balance. The order flip, the balance decrement
 * (only if it covers the amount) and the ledger line happen together or not at all; the
 * ledger's unique orderId stops the same order from being paid twice.
 */
export async function payOrderWithBalance(orderId: string, userId: string) {
  const account = await corporateAccount(userId);
  if (!account.usable) throw new CorporateError("Kurumsal bakiye kullanılamıyor.");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: { select: { title: true, seller: { select: { synthetic: true, suspended: true } } } } },
  });
  if (!order || order.buyerId !== userId) throw new CorporateError("Sipariş bulunamadı.");
  if (order.status !== "PENDING_PAYMENT") throw new CorporateError("Bu sipariş ödeme beklemiyor.");
  if (!sellerTakesOrders(order.gig.seller)) throw new CorporateError("Bu satıcı şu an yeni sipariş almıyor.");

  const payable = payableAmount({ amount: order.amount, ...(await refreshOrderDiscounts(order)) });

  await prisma.$transaction(async (tx) => {
    const flipped = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: { status: "PAID" },
    });
    if (flipped.count === 0) throw new CorporateError("Bu sipariş ödeme beklemiyor.");
    const charged = await tx.user.updateMany({
      where: { id: userId, balance: { gte: payable } },
      data: { balance: { decrement: payable } },
    });
    if (charged.count === 0) throw new CorporateError("Bakiyen bu sipariş için yetersiz.");
    await tx.balanceEntry.create({
      data: { userId, kind: "ORDER", amount: -payable, orderId, note: order.gig.title },
    });
    await tx.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider: "bakiye",
        status: "SUCCESS",
        conversationId: randomUUID(),
        paymentId: `bakiye_${randomUUID()}`,
        rawResponse: { mode: "bakiye", amount: payable },
      },
      update: { provider: "bakiye", status: "SUCCESS", rawResponse: { mode: "bakiye", amount: payable } },
    });
  });

  // Status is already PAID; this sends the "ödemen alındı / yeni sipariş" e-mails.
  await markOrderPaid(orderId);
}

/** Spending per month (orders paid from the balance), newest first — the monthly statement. */
export function monthlySpending(entries: { kind: string; amount: unknown; createdAt: Date }[]) {
  const fmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
  const byMonth = new Map<string, { label: string; total: number; count: number }>();
  for (const e of entries) {
    if (e.kind !== "ORDER") continue;
    const label = fmt.format(e.createdAt);
    const row = byMonth.get(label) ?? { label, total: 0, count: 0 };
    row.total += -Number(e.amount);
    row.count += 1;
    byMonth.set(label, row);
  }
  return [...byMonth.values()];
}
