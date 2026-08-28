/**
 * One-off driver that writes prisma/migrations/20260827230000_named_freelancer_pending_orders/
 * migration.sql: a real, pending (PENDING_VERIFICATION) order for each of the 161 named
 * freelancers, matching what their gig's standard package actually costs — so the
 * "Havale Onayı Bekliyor" queue on /admin/siparisler and /admin/havale-onaylari has real
 * work in it instead of sitting empty (every earlier havale order was pre-approved).
 * Not meant to run against a live database — it only emits SQL that `prisma migrate
 * deploy` applies later.
 */

import { writeFileSync } from "fs";
import { generateNamedFreelancers } from "../prisma/named-freelancers";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

const named = generateNamedFreelancers();
const BUYER_POOL = 966; // prisma/synthetic-buyers.ts (alici1..alici966)

const rows = named.map((p, i) => {
  const seq = String(i + 1).padStart(4, "0");
  const standard = p.gig.packages[1]; // [BASIC, STANDARD, PREMIUM]
  const buyerIndex = (i % BUYER_POOL) + 1;
  return {
    seq,
    gigId: `named-gig-${seq}`,
    packageId: `named-pkg-${seq}-1`,
    amount: standard.price,
    buyerEmail: `alici${buyerIndex}@demo.prosinta.com`,
  };
});

const sql =
  `-- Havale/EFT ile ödeyip onay bekleyen sipariş: 161 gerçek isimli freelancer'ın\n` +
  `-- sayfasındaki hakediş ödemesine karşılık gelen sipariş. named_freelancer_profiles\n` +
  `-- migration'ı bu kişilere bir ilan verdi ama hiçbirine bağlı bir sipariş yoktu — admin\n` +
  `-- Siparişler ve Havale/EFT Onayları ekranlarında "Havale Onayı Bekliyor" kuyruğu bu\n` +
  `-- yüzden boştu. Her ilanın kendi standart paket fiyatı kadar, 26.08.2026 tarihli,\n` +
  `-- PENDING_VERIFICATION durumunda bir sipariş + 'havale' ödeme kaydı ekler. Alıcı,\n` +
  `-- sentetik alıcı havuzundan (alici1..alici966) sırayla dağıtılır.\n\n` +
  `INSERT INTO "orders" ("id", "status", "amount", "escrowReleased", "buyerId", "gigId", "packageId", "createdAt", "updatedAt")\n` +
  `SELECT v.id, 'PENDING_VERIFICATION', v.amount, false, u.id, v.gig_id, v.package_id,\n` +
  `       TIMESTAMP '2026-08-26 12:00:00' - make_interval(mins => v.seq::int), now()\n` +
  `FROM (VALUES\n` +
  rows
    .map(
      (r) =>
        `  (${quote(`named-order-${r.seq}`)}, ${r.seq}, ${quote(r.gigId)}, ${quote(r.packageId)}, ${r.amount}, ${quote(r.buyerEmail)})`
    )
    .join(",\n") +
  `\n) AS v(id, seq, gig_id, package_id, amount, buyer_email)\n` +
  `JOIN "users" u ON u.email = v.buyer_email\n` +
  `ON CONFLICT ("id") DO NOTHING;\n\n` +
  `INSERT INTO "payments" ("id", "provider", "status", "conversationId", "rawResponse", "orderId", "createdAt", "updatedAt")\n` +
  `SELECT ${quote("named-pay-")} || lpad(s.seq::text, 4, '0'), 'havale', 'INITIALIZED',\n` +
  `       ${quote("named-conv-")} || lpad(s.seq::text, 4, '0'), '{"mode":"havale","imported":true}'::jsonb,\n` +
  `       ${quote("named-order-")} || lpad(s.seq::text, 4, '0'), now(), now()\n` +
  `FROM generate_series(1, ${rows.length}) AS s(seq)\n` +
  `WHERE EXISTS (SELECT 1 FROM "orders" o WHERE o."id" = ${quote("named-order-")} || lpad(s.seq::text, 4, '0'))\n` +
  `ON CONFLICT ("orderId") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260827230000_named_freelancer_pending_orders/migration.sql",
  sql
);
console.log("named pending orders:", rows.length);
console.log("örnek:", rows[0], rows[rows.length - 1]);
