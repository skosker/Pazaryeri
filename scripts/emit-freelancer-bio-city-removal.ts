/**
 * One-off driver that writes a migration.sql stripping every mention of a freelancer's
 * city out of their bio text ("İstanbul'da yaşıyorum...", "Konum: Ankara.", etc.) —
 * prisma/synthetic-freelancers.ts's buildBio() no longer references the city at all, so
 * this just recomputes `bio` for every profile the two fully-deterministic generators
 * (generateSyntheticFreelancers, generateNamedFreelancers) already produce and updates
 * the matching row by e-mail.
 *
 * Only `bio` changes: name/age/city/skills/image and everything else stay exactly what
 * is already live, since removing the city from the templates does not shift any other
 * random draw — buildBio's own template-index draw sits at the same position in each
 * profile's RNG stream as before.
 *
 * The ~208 pre-existing showcase sellers (8 named demo accounts + fl1..fl200, via
 * describeShowcaseFreelancer) are deliberately NOT covered here: their bio depends on
 * live gig data (loadShowcaseOffers) this script cannot safely replay against
 * production from a local database. A separate, content-agnostic regexp_replace
 * migration cleans up their leftover city mentions instead — see the next migration.
 *
 * Not meant to run against a live database — it only emits SQL into prisma/migrations/,
 * which `prisma migrate deploy` then applies.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateSyntheticFreelancers } from "../prisma/synthetic-freelancers";
import { generateNamedFreelancers } from "../prisma/named-freelancers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const synthetic = generateSyntheticFreelancers();
  const named = generateNamedFreelancers();

  const rows = [
    ...synthetic.map((p) => ({ email: p.email, bio: p.bio })),
    ...named.map((p) => ({ email: p.email, bio: p.bio })),
  ];

  // Sanity guard: every row this script would write must match an existing FREELANCER
  // e-mail, or the local database this ran against does not have the profiles it thinks
  // it is updating.
  const existing = await prisma.user.findMany({
    where: { email: { in: rows.map((r) => r.email) }, role: "FREELANCER" },
    select: { email: true },
  });
  const knownEmails = new Set(existing.map((u) => u.email));
  const missing = rows.filter((r) => !knownEmails.has(r.email));
  if (missing.length > 0) {
    console.error(`${missing.length} generated e-mail(s) have no matching FREELANCER row, e.g.`, missing.slice(0, 5));
    process.exit(1);
  }

  const sql =
    `-- Freelancer biyografilerinden konum (şehir) bahsini kaldırır.\n` +
    `--\n` +
    `-- prisma/synthetic-freelancers.ts'teki buildBio(), "İstanbul'da yaşıyorum...",\n` +
    `-- "... merkezli çalışıyorum...", "Konum: Ankara." gibi şehir geçen cümleleri\n` +
    `-- kaldıracak şekilde güncellendi. Bu migration, iki tam deterministik üretecin\n` +
    `-- (tam sentetik 4466, isimli 161) ürettiği yeni metni e-posta ile eşleştirip\n` +
    `-- yalnızca "bio" alanını günceller — ad/yaş/şehir/uzmanlık/fotoğraf gibi diğer her\n` +
    `-- şey aynı kalır. Önceden var olan 8 isimli + fl1..fl200 vitrin satıcısı ayrı bir\n` +
    `-- migration'da (regexp_replace ile) temizleniyor.\n` +
    `--\n` +
    `-- scripts/emit-freelancer-bio-city-removal.ts tarafından üretildi.\n\n` +
    `UPDATE "users" AS u\n` +
    `SET "bio" = v.bio\n` +
    `FROM (VALUES\n` +
    rows.map((r) => `  (${quote(r.email)}, ${quote(r.bio)})`).join(",\n") +
    `\n) AS v(email, bio)\n` +
    `WHERE u.email = v.email AND u."role" = 'FREELANCER';\n`;

  const dir = "/home/user/Pazaryeri/prisma/migrations/20260830090000_freelancer_bio_city_removal";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);
  console.log("updated bios:", rows.length);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
