/**
 * One-off driver that writes a migration.sql capitalising the first letter of every
 * generated gig's title/description that currently starts with a lowercase letter.
 *
 * Root cause: two of named-freelancers.ts's gigTitleTemplates (and one of
 * gigDescriptionTemplates) open with `${title.toLowerCase()}` or a skills list whose
 * first entry can itself be a lowercase-stylised brand name (e.g. "iyzico
 * Entegrasyonu") — correct mid-sentence, but wrong as the first word of a Turkish
 * sentence, which must start with a capital letter. buildGig() now runs its output
 * through capitalizeFirst() going forward; this migration is the one-time backfill for
 * every already-inserted row the old code produced.
 *
 * Scoped to the three deterministic, generator-produced id families only
 * (bump-gig-*, catboost-gig-*, named-gig-*) — real, user-authored gigs are left
 * untouched, since a human's own free-text title is their content, not this bug.
 *
 * Reads the live gigs table — this migration relabels existing rows, it doesn't create
 * new ones — so it needs a DATABASE_URL. Not meant to run against a live database
 * itself; it only emits SQL into prisma/migrations/, which `prisma migrate deploy`
 * then applies.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { capitalizeFirst } from "../prisma/named-freelancers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const gigs = await prisma.gig.findMany({
    where: {
      OR: [
        { id: { startsWith: "bump-gig-" } },
        { id: { startsWith: "catboost-gig-" } },
        { id: { startsWith: "named-gig-" } },
      ],
    },
    select: { id: true, title: true, description: true },
    orderBy: { id: "asc" },
  });

  const fixes = gigs
    .map((gig) => ({
      id: gig.id,
      oldTitle: gig.title,
      oldDescription: gig.description,
      newTitle: capitalizeFirst(gig.title),
      newDescription: capitalizeFirst(gig.description),
    }))
    .filter((fix) => fix.newTitle !== fix.oldTitle || fix.newDescription !== fix.oldDescription);

  console.log(`${fixes.length} / ${gigs.length} generated gigs need a capitalisation fix.`);
  for (const fix of fixes.slice(0, 10)) {
    console.log(`  ${fix.id}`);
    if (fix.newTitle !== fix.oldTitle) console.log(`    title: ${fix.oldTitle} -> ${fix.newTitle}`);
    if (fix.newDescription !== fix.oldDescription)
      console.log(`    desc:  ${fix.oldDescription} -> ${fix.newDescription}`);
  }

  if (fixes.length === 0) {
    console.log("Düzeltilecek satır yok, migration yazılmadı.");
    return;
  }

  const sql =
    `-- named-freelancers.ts'nin ilan başlığı/açıklaması şablonlarından bazıları, ilk\n` +
    `-- kelimesi küçük harfle yazılmış bir marka adı ("iyzico Entegrasyonu" gibi) ya da\n` +
    `-- ${"${title.toLowerCase()}"} olan bir kalıpla başlayabiliyordu — cümle içinde doğru,\n` +
    `-- ama Türkçe yazım kurallarına göre cümlenin ilk harfi büyük olmalı. buildGig() artık\n` +
    `-- bunu capitalizeFirst() ile düzeltiyor; bu migration daha önce eski koddan üretilmiş\n` +
    `-- satırları tek seferlik geriye dönük düzeltir. Yalnızca üretici script'lerin\n` +
    `-- oluşturduğu ilanlar kapsamdadır (bump-gig-*, catboost-gig-*, named-gig-*);\n` +
    `-- gerçek kullanıcıların kendi yazdığı ilan başlıkları değiştirilmez.\n` +
    `--\n` +
    `-- scripts/emit-gig-title-capitalization-fix.ts tarafından üretildi.\n\n` +
    `UPDATE "gigs" AS g\n` +
    `SET "title" = v.title, "description" = v.description\n` +
    `FROM (VALUES\n` +
    fixes.map((f) => `  (${quote(f.id)}, ${quote(f.newTitle)}, ${quote(f.newDescription)})`).join(",\n") +
    `\n) AS v(id, title, description)\n` +
    `WHERE g."id" = v.id;\n`;

  const dir = "/home/user/Pazaryeri/prisma/migrations/20260916180000_gig_title_capitalization_fix";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);
  console.log(`\nwrote ${dir}/migration.sql`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
