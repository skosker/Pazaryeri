import { prisma } from "@/lib/prisma";

/**
 * Month by month (Istanbul calendar months, from REPORT_START): what Prosinta earned, what it paid for out of
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

/** The first month the report shows: the site went live in August 2026. */
export const REPORT_START = "2026-08";

/** `column` is a (possibly table-qualified) SQL column expression, e.g. `o."createdAt"`. */
const monthOf = (column: string) =>
  `to_char(date_trunc('month', (${column} AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul'), 'YYYY-MM')`;

/**
 * Orders between real people only. The bank-transfer Excel import creates orders for
 * generated (synthetic) buyers on showcase gigs; they are history, not revenue or volume.
 */
const REAL_ORDERS = `FROM orders o
  JOIN users b ON b.id = o."buyerId"
  JOIN gigs g ON g.id = o."gigId"
  JOIN users s ON s.id = g."sellerId"
  WHERE NOT b.synthetic AND NOT s.synthetic AND o.status NOT IN ('PENDING_PAYMENT', 'CANCELLED')`;

async function sumByMonth(sql: string, since: Date): Promise<Map<string, { total: number; count: number }>> {
  const rows = await prisma.$queryRawUnsafe<Row[]>(sql, since);
  return new Map(rows.map((r) => [r.month, { total: Number(r.total ?? 0), count: Number(r.count ?? 0) }]));
}

export async function monthlyRevenue(): Promise<RevenueMonth[]> {
  const now = new Date();
  const istanbulNow = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  // From this month back to REPORT_START, newest first (at most 36 months shown).
  const keys: string[] = [];
  for (let i = 0; i < 36; i++) {
    const d = new Date(Date.UTC(istanbulNow[0], istanbulNow[1] - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (key < REPORT_START) break;
    keys.push(key);
  }
  // A day of slack before the first month's start covers the Istanbul/UTC offset.
  const oldest = keys[keys.length - 1].split("-").map(Number);
  const since = new Date(Date.UTC(oldest[0], oldest[1] - 1, 1) - 24 * 60 * 60 * 1000);

  const [membership, corporatePlans, boosts, commission, firstOrder, referral, corporateDisc, bonuses, volume] =
    await Promise.all([
      sumByMonth(
        `SELECT ${monthOf('"updatedAt"')} AS month, SUM(amount) AS total FROM pro_purchases
         WHERE status = 'SUCCESS' AND plan IN ('PRO', 'PRO_PLUS') AND "updatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('"updatedAt"')} AS month, SUM(amount) AS total FROM pro_purchases
         WHERE status = 'SUCCESS' AND plan IN ('KURUMSAL', 'KURUMSAL_PLUS') AND "updatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('"activatedAt"')} AS month, SUM(amount) AS total FROM gig_boosts
         WHERE status = 'SUCCESS' AND "creditMonth" IS NULL AND "activatedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('p."createdAt"')} AS month, SUM(p.commission) AS total FROM payouts p
         JOIN users s ON s.id = p."sellerId"
         WHERE p.status <> 'FAILED' AND NOT s.synthetic AND p."createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('o."createdAt"')} AS month, SUM(o.discount) AS total ${REAL_ORDERS}
         AND o."createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('o."createdAt"')} AS month, SUM(o."creditDiscount") AS total ${REAL_ORDERS}
         AND o."createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('o."createdAt"')} AS month, SUM(o."corporateDiscount") AS total ${REAL_ORDERS}
         AND o."createdAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('"confirmedAt"')} AS month, SUM(bonus) AS total FROM balance_top_ups
         WHERE status = 'SUCCESS' AND "confirmedAt" >= $1 GROUP BY 1`,
        since
      ),
      sumByMonth(
        `SELECT ${monthOf('o."createdAt"')} AS month, SUM(o.amount) AS total, COUNT(*) AS count ${REAL_ORDERS}
         AND o."createdAt" >= $1 GROUP BY 1`,
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
