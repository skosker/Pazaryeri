/**
 * One-off driver that finds and fixes a specific data-corruption bug in the synthetic
 * freelancer pool: a wrong first name embedded in someone's bio.
 *
 * Root cause: `20260819180000_rename_demo_email_domain` renamed the original 1000
 * `uzman1..uzman1000@profestia.dev` rows to `@demo.prosinta.com` by a blind string
 * replace on the e-mail column. That collided their addresses with what
 * `generateSyntheticFreelancers(4466)` (using the *current* domain) independently
 * computes for the same indices — a different, unrelated identity, since the RNG in
 * synthetic-freelancers.ts is seeded from `hash32(email)` and the domain is part of the
 * e-mail. `20260827200000_bump_synthetic_freelancers`'s `ON CONFLICT ("email") DO
 * NOTHING` then left the old row's name/title/city/age/skills untouched, but
 * `20260830090000_freelancer_bio_city_removal`'s by-email `UPDATE` overwrote its `bio`
 * with the *new*, unrelated identity's bio — including that identity's own first name
 * in the "Merhaba, ben X." template, which no longer matches the row's real name.
 *
 * This script reads the original 1000 rows straight out of that first migration file
 * (their name is exactly what production still shows, since it was never touched
 * again), recomputes what `generateSyntheticFreelancers(4466)` currently produces for
 * the same index (exactly what production's `bio` column was overwritten with), and
 * where that bio opens with a name that does not match the row's real name, patches
 * just that opening clause — nothing else in the sentence is touched, since the rest of
 * the bio (title/skills/years) is a generic, still-plausible narrative independent of
 * whose name is on it.
 *
 * Not meant to run against a live database — it only emits SQL into prisma/migrations/,
 * which `prisma migrate deploy` then applies.
 */

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { generateSyntheticFreelancers } from "../prisma/synthetic-freelancers";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

const original = readFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260819110000_seed_synthetic_freelancers/migration.sql",
  "utf8"
);

// Pulls ('uzmanN@profestia.dev', 'Name', ...) out of the VALUES list without caring
// about the columns after name — only the first two matter here.
const rowPattern = /\('uzman(\d+)@profestia\.dev', '((?:[^'\\]|'')*)',/g;

const oldByIndex = new Map<number, string>();
for (const match of original.matchAll(rowPattern)) {
  const index = Number(match[1]);
  const name = match[2].replace(/''/g, "'");
  oldByIndex.set(index, name);
}

if (oldByIndex.size !== 1000) {
  throw new Error(`expected 1000 original uzman rows, parsed ${oldByIndex.size}`);
}

const current = generateSyntheticFreelancers(4466);
const nameClause = /^Merhaba, ben ([^.]+)\./;

const fixes: { email: string; oldName: string; oldBio: string; newBio: string }[] = [];

for (const [index, oldName] of oldByIndex) {
  const person = current[index - 1]; // generateSyntheticFreelancers is 0-indexed
  const email = `uzman${index}@demo.prosinta.com`;
  if (person.email !== email) throw new Error(`index mismatch at ${index}: ${person.email}`);

  const match = person.bio.match(nameClause);
  if (!match) continue; // this template never named anyone; nothing to fix
  const bioName = match[1];
  const oldFirstName = oldName.split(" ")[0];
  if (bioName === oldFirstName) continue; // coincidentally already consistent

  const newBio = person.bio.replace(nameClause, `Merhaba, ben ${oldFirstName}.`);
  fixes.push({ email, oldName, oldBio: person.bio, newBio });
}

console.log(`${fixes.length} / ${oldByIndex.size} profiles need a bio name fix.`);
console.log("Examples:");
for (const fix of fixes.slice(0, 5)) {
  console.log(`  ${fix.email} (${fix.oldName})`);
  console.log(`    once: ${fix.oldBio}`);
  console.log(`     now: ${fix.newBio}`);
}

const sql =
  `-- 1000'lik ilk sentetik freelancer havuzunda, e-posta alan adı değişikliğinin\n` +
  `-- (20260819180000_rename_demo_email_domain) yol açtığı bir çakışmayı düzeltir: o\n` +
  `-- taşımadan sonra bu 1000 kişinin adresi, 4466'ya genişletilmiş yeni havuzun aynı\n` +
  `-- index'teki FARKLI bir kişisiyle aynı e-postaya düştü. ON CONFLICT DO NOTHING bu\n` +
  `-- eski kişinin ad/unvan/şehir/yaş/uzmanlığını korudu, ama sonraki bio güncellemesi\n` +
  `-- (20260830090000_freelancer_bio_city_removal) e-posta üzerinden eşleşip bio'yu o\n` +
  `-- YENİ kişinin metniyle değiştirdi — "Merhaba, ben X." cümlesindeki X, artık sayfada\n` +
  `-- görünen gerçek adla uyuşmuyor. Bu migration yalnızca o açılış cümlesini, kişinin\n` +
  `-- kendi adına düzeltir; cümlenin geri kalanı (unvan/yıl/uzmanlık) olduğu gibi kalır.\n` +
  `--\n` +
  `-- scripts/emit-freelancer-bio-name-fix.ts tarafından üretildi.\n\n` +
  `UPDATE "users" AS u\n` +
  `SET "bio" = v.bio\n` +
  `FROM (VALUES\n` +
  fixes.map((f) => `  (${quote(f.email)}, ${quote(f.oldName)}, ${quote(f.newBio)})`).join(",\n") +
  `\n) AS v(email, name, bio)\n` +
  `WHERE u."email" = v.email AND u."name" = v.name AND u."role" = 'FREELANCER';\n`;

const dir = "/home/user/Pazaryeri/prisma/migrations/20260902060000_fix_freelancer_bio_name_mismatch";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/migration.sql`, sql);
console.log(`\nwrote ${dir}/migration.sql`);
