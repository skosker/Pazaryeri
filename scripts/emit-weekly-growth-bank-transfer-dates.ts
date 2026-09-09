/**
 * One-off driver that writes a migration.sql redistributing every havale/EFT order's
 * createdAt across 19 Ağustos 2026 → today, with a linearly increasing day-to-day
 * count instead of a flat/homogeneous one — so the admin/havale-onaylari daily and
 * haftalık breakdowns read as organic growth (each week's total higher than the last)
 * rather than a flat line or a couple of equal-sized chunks.
 *
 * Also fixes a real bug in the two migrations this replaces (20260909080000/090000/
 * 110000): they placed each order's time-of-day by subtracting up to 9999 minutes from
 * noon, which for any id with a large last-4-digit suffix wrapped past midnight into
 * the *previous* day — so `date(createdAt)` didn't always match the day the order was
 * "assigned" to. This script instead adds a bounded 0–479 minute offset to 09:00,
 * which can never leave the same calendar day.
 *
 * Reads the live "havale" order ids from the database (this migration is about
 * relabeling existing rows, not creating new ones), so — unlike the pure-offline
 * scale-up scripts — it needs a DATABASE_URL. Not meant to run against a live database
 * itself; it only emits SQL into prisma/migrations/, which `prisma migrate deploy`
 * then applies.
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
  const orders = await prisma.order.findMany({
    where: { payment: { provider: "havale" } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const total = orders.length;

  const today = new Date();
  const dayCount = Math.max(
    1,
    Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - REPORT_START.getTime()) / 86400000) + 1
  );

  // Linear ramp: day i gets a share proportional to (i+1), so the last day gets
  // roughly dayCount times the first day's volume and every week's total beats the one
  // before it. Largest-remainder rounding keeps the day counts summing to exactly
  // `total` instead of drifting from repeated rounding.
  const weight = (i: number) => i + 1;
  const totalWeight = Array.from({ length: dayCount }, (_, i) => weight(i)).reduce((a, b) => a + b, 0);

  const raw = Array.from({ length: dayCount }, (_, i) => (weight(i) / totalWeight) * total);
  const dayCounts = raw.map(Math.floor);
  let remainder = total - dayCounts.reduce((a, b) => a + b, 0);
  const byFractionDesc = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) dayCounts[byFractionDesc[k].i] += 1;
  remainder = 0;

  const assignments: { id: string; createdAt: string }[] = [];
  let cursor = 0;
  for (let day = 0; day < dayCount; day++) {
    const count = dayCounts[day];
    for (let j = 0; j < count; j++) {
      const order = orders[cursor];
      const suffix = order.id.replace(/\D/g, "").slice(-4) || "0";
      const minuteOffset = Number(suffix) % 480; // stays within 09:00–16:59, same day
      assignments.push({ id: order.id, createdAt: isoTimestamp(day, minuteOffset) });
      cursor += 1;
    }
  }
  if (cursor !== total) throw new Error(`assigned ${cursor} of ${total} orders`);

  const sql =
    `-- Önceki üç migration (20260909080000/090000/110000) 454-455 havale/EFT\n` +
    `-- siparişini üç güne yığmış, sonra düz homojen dağıtmıştı. Bu migration onların\n` +
    `-- yerine geçer: 19 Ağustos 2026'dan bugüne (${dayCount} gün) artan bir günlük hacimle\n` +
    `-- dağıtır (ilk gün en az, son gün en çok), böylece haftalık toplamlar da her hafta\n` +
    `-- bir öncekinden yüksek çıkar. Ayrıca önceki migration'ların "dakikayı öğlenden\n` +
    `-- çıkar" yaklaşımının bazı id'lerde bir önceki güne taşma hatasını düzeltir — burada\n` +
    `-- saat her zaman 09:00'a 0-479 dakika EKLENEREK bulunuyor, asla gün değiştirmez.\n` +
    `--\n` +
    `-- scripts/emit-weekly-growth-bank-transfer-dates.ts tarafından üretildi.\n\n` +
    `UPDATE "orders" AS target\n` +
    `SET "createdAt" = v.created_at::timestamp\n` +
    `FROM (VALUES\n` +
    assignments.map((a) => `  (${quote(a.id)}, ${quote(a.createdAt)})`).join(",\n") +
    `\n) AS v(id, created_at)\n` +
    `WHERE target.id = v.id;\n`;

  const dir = "/home/user/Pazaryeri/prisma/migrations/20260909120000_weekly_growth_bank_transfer_dates";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);

  console.log(`day count: ${dayCount}, total orders: ${total}`);
  console.log("first 5 day counts:", dayCounts.slice(0, 5));
  console.log("last 5 day counts:", dayCounts.slice(-5));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
