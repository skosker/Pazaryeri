import { prisma } from "@/lib/prisma";

/**
 * Month by month (Istanbul calendar months): what Prosinta earned, what it paid for out of
 * its own pocket, and the order volume behind it — for Admin → Gelir Raporu. Amounts are
 * as charged (KDV dahil). Timestamps are stored as UTC without a zone, hence the double
 * AT TIME ZONE to land on the Istanbul month.
 */

export type RevenueMonth = {
  month: string; // "2026-09"
  membership: number;
  corporatePlans: number;
  boosts: number;
  commission: number;
  firstOrderDiscounts: number;
  referralCredits: number;
  corporateDiscounts: number;
  topUpBonuses: number;
  /** Paid orders' package prices (hacim, not Prosinta's income). */
  orderVolume: number;
  orderCount: number;
};

type Row = { month: string; total: number | string | null; count?: bigint | number | null };

const monthOf = (column: string) =>
  `to_char(date_trunc('month', ("${column}" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul'), 'YYYY-MM')`;

async function sumByMonth(sql: string, since: Date): Promise<Map<string, { total: number; count: number }>> {
  const rows = await prisma.$queryRawUnsafe<Row[]>(sql, since);
  return new Map(rows.map((r) => [r.month, { total: Number(r.total ?? 0), count: Number(r.count ?? 0) }]));
}

export async function monthlyRevenue(months = 12): Promise<RevenueMonth[]> {
  const now = new Date();
  const istanbulNow = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  const keys: string[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(istanbulNow[0], istanbulNow[1] - 1 - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  // A day of slack before the first month's start covers the Istanbul/UTC offset.
  const oldest = keys[keys.length - 1].split("-").map(Number);
  const since = new Date(Date.UTC(oldest[0], oldest[1] - 1, 1) - 24 * 60 * 60 * 1000);

  const paidOrders = `status NOT IN ('PENDING_PAYMENT', 'CANCELLED')`;
  const [membership, corporatePlans, boosts, commission, firstOrder, referral, corporateDisc, bonuses, volume] =
    await Promise.all([
      sumByMonth(
        `SELECT ${monthOf("updatedAt")} AS month, SUM(amount) AS total FROM pro_purchases
         WHERE status = 'SUCCESS' AND plan IN ('PRO', 'PRO_PLUS') AND "updatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("updatedAt")} AS month, SUM(amount) AS total FROM pro_purchases
         WHERE status = 'SUCCESS' AND plan IN ('KURUMSAL', 'KURUMSAL_PLUS') AND "updatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("activatedAt")} AS month, SUM(amount) AS total FROM gig_boosts
         WHERE status = 'SUCCESS' AND "creditMonth" IS NULL AND "activatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("createdAt")} AS month, SUM(commission) AS total FROM payouts
         WHERE status <> 'FAILED' AND "createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("createdAt")} AS month, SUM(discount) AS total FROM orders
         WHERE ${paidOrders} AND "createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("createdAt")} AS month, SUM("creditDiscount") AS total FROM orders
         WHERE ${paidOrders} AND "createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("createdAt")} AS month, SUM("corporateDiscount") AS total FROM orders
         WHERE ${paidOrders} AND "createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("confirmedAt")} AS month, SUM(bonus) AS total FROM balance_top_ups
         WHERE status = 'SUCCESS' AND "confirmedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf("createdAt")} AS month, SUM(amount) AS total, COUNT(*) AS count FROM orders
         WHERE ${paidOrders} AND "createdAt" >= $1 GROUP BY 1`,
        since
      ),
    ]);

  const v = (m: Map<string, { total: number }>, k: string) => Math.round((m.get(k)?.total ?? 0) * 100) / 100;
  return keys.map((k) => ({
    month: k,
    membership: v(membership, k),
    corporatePlans: v(corporatePlans, k),
    boosts: v(boosts, k),
    commission: v(commission, k),
    firstOrderDiscounts: v(firstOrder, k),
    referralCredits: v(referral, k),
    corporateDiscounts: v(corporateDisc, k),
    topUpBonuses: v(bonuses, k),
    orderVolume: v(volume, k),
    orderCount: volume.get(k)?.count ?? 0,
  }));
}

export function income(m: RevenueMonth): number {
  return m.membership + m.corporatePlans + m.boosts + m.commission;
}

export function costs(m: RevenueMonth): number {
  return m.firstOrderDiscounts + m.referralCredits + m.corporateDiscounts + m.topUpBonuses;
}
