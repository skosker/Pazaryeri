/**
 * One-off driver that writes a migration.sql updating the 161 named freelancers' gig
 * packages (483 rows) to price from their profession's category band instead of from
 * their unrelated hakediş (payout) amount — see prisma/named-freelancers.ts's
 * generateNamedFreelancers() for the actual fix. Deliberately does not touch orders,
 * payments, or freelancer_payouts: those record real historical amounts and stay as-is.
 *
 * Not meant to run against a live database — it only emits SQL into prisma/migrations/,
 * which `prisma migrate deploy` then applies.
 */

import { mkdirSync, writeFileSync } from "fs";
import { generateNamedFreelancers } from "../prisma/named-freelancers";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

const named = generateNamedFreelancers();

const rows = named.flatMap((p, i) => {
  const seq4 = String(i + 1).padStart(4, "0");
  return p.gig.packages.map(
    (pkg, ti) =>
      `  (${quote(`named-pkg-${seq4}-${ti}`)}, ${pkg.price}, ${pkg.deliveryDays}, ${pkg.revisionCount})`
  );
});

const sql =
  `-- 161 gerçek isimli freelancer'ın ilan fiyatlarını meslek/kategori bandına çeker.\n` +
  `--\n` +
  `-- named_freelancer_profiles migration'ı bu kişilerin standart paket fiyatını kendi\n` +
  `-- hakediş ödemesi tutarına eşitlemişti — ilanın konusuyla ilgisi olmayan bir sayı.\n` +
  `-- Aynı meslekteki "bump" ilanlar (bump_freelancer_gigs) zaten kategori fiyat\n` +
  `-- bandından fiyatlanıyordu; bu migration named freelancer'ları da aynı bantla\n` +
  `-- fiyatlandırıp aradaki tutarsızlığı (örn. aynı meslekte 970₺ - 100.000₺ farkı) giderir.\n` +
  `-- prisma/named-freelancers.ts (bandPrice()) tarafından üretildi.\n` +
  `--\n` +
  `-- Hakediş ödemeleri (freelancer_payouts), bekleyen havale siparişleri (orders/payments)\n` +
  `-- ve gig başlığı/açıklaması bilinçli olarak dokunulmadan bırakıldı: bunlar gerçek\n` +
  `-- geçmiş kayıtlar, ilan fiyatı zamanla değişebilir.\n\n` +
  `UPDATE "packages" AS p\n` +
  `SET "price" = v.price, "deliveryDays" = v.delivery_days, "revisionCount" = v.revision_count\n` +
  `FROM (VALUES\n` +
  rows.join(",\n") +
  `\n) AS v(id, price, delivery_days, revision_count)\n` +
  `WHERE p.id = v.id;\n`;

const dir = "/home/user/Pazaryeri/prisma/migrations/20260828080000_named_freelancer_price_fix";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/migration.sql`, sql);
console.log("updated packages:", rows.length);
