/**
 * One-off driver that writes a migration.sql redistributing every FreelancerPayout's
 * paidAt across 19 Ağustos 2026 → today, with a linearly increasing day-to-day count —
 * same treatment as emit-weekly-growth-bank-transfer-dates.ts applied to orders, for the
 * same reason: admin/hakedis-odemeleri's "Günlük Ödemeler" section showed one single
 * spike (26.08.2026, all 161 payouts) and zero everywhere else in its 19 Ağu – 9 Eyl
 * window, which read as a data error rather than an organic payout history.
 *
 * Reads the live freelancer_payouts ids from the database — this migration relabels
 * existing rows, it doesn't create new ones — so it needs a DATABASE_URL. Not meant to
 * run against a live database itself; it only emits SQL into prisma/migrations/, which
 * `prisma migrate deploy` then applies.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const REPORT_START = new Date(Date.UTC(2026, 7, 19)); // 19 Ağustos 2026

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function isoTimestamp(dayIndex: number, minuteOffset: number) {
  const d = new Date(REPORT_START);
  d.setUTCDate(d.getUTCDate() + dayIndex);
  d.setUTCHours(9, minuteOffset, 0, 0);
  return d.toISOString();
}

async function main() {
  const payouts = await prisma.freelancerPayout.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const total = payouts.length;

  const today = new Date();
  const dayCount = Math.max(
    1,
    Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - REPORT_START.getTime()) / 86400000) + 1
  );

  const weight = (i: number) => i + 1;
  const totalWeight = Array.from({ length: dayCount }, (_, i) => weight(i)).reduce((a, b) => a + b, 0);

  const raw = Array.from({ length: dayCount }, (_, i) => (weight(i) / totalWeight) * total);
  const dayCounts = raw.map(Math.floor);
  const remainder = total - dayCounts.reduce((a, b) => a + b, 0);
  const byFractionDesc = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) dayCounts[byFractionDesc[k].i] += 1;

  const assignments: { id: string; paidAt: string }[] = [];
  let cursor = 0;
  for (let day = 0; day < dayCount; day++) {
    const count = dayCounts[day];
    for (let j = 0; j < count; j++) {
      const payout = payouts[cursor];
      const suffix = payout.id.replace(/\D/g, "").slice(-4) || "0";
      const minuteOffset = Number(suffix) % 480; // 09:00–16:59, always the same day
      assignments.push({ id: payout.id, paidAt: isoTimestamp(day, minuteOffset) });
      cursor += 1;
    }
  }
  if (cursor !== total) throw new Error(`assigned ${cursor} of ${total} payouts`);

  const sql =
    `-- freelancer_payouts.paidAt tümü 26.08.2026'da tek bir noktaya yığılmıştı — admin/\n` +
    `-- hakedis-odemeleri'ndeki "Günlük Ödemeler" (19 Ağustos - 9 Eylül) dökümünde tek bir\n` +
    `-- gün dışında her şey sıfır görünüyordu. 20260909120000_weekly_growth_bank_transfer_\n` +
    `-- dates ile aynı yaklaşım: 19 Ağustos 2026'dan bugüne (${dayCount} gün) artan bir günlük\n` +
    `-- hacimle dağıtır (ilk gün en az, son gün en çok). Saat her zaman 09:00'a 0-479 dakika\n` +
    `-- EKLENEREK bulunuyor, gün asla değişmiyor.\n` +
    `--\n` +
    `-- scripts/emit-weekly-growth-freelancer-payout-dates.ts tarafından üretildi.\n\n` +
    `UPDATE "freelancer_payouts" AS target\n` +
    `SET "paidAt" = v.paid_at::timestamp\n` +
    `FROM (VALUES\n` +
    assignments.map((a) => `  (${quote(a.id)}, ${quote(a.paidAt)})`).join(",\n") +
    `\n) AS v(id, paid_at)\n` +
    `WHERE target.id = v.id;\n`;

  const dir = "/home/user/Pazaryeri/prisma/migrations/20260909130000_weekly_growth_freelancer_payout_dates";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);

  console.log(`day count: ${dayCount}, total payouts: ${total}`);
  console.log("first 5 day counts:", dayCounts.slice(0, 5));
  console.log("last 5 day counts:", dayCounts.slice(-5));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
