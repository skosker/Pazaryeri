/**
 * One-off driver that writes a migration.sql giving a gig to most of the synthetic
 * "uzman" freelancers who still only have a profile — dropping the "İlan Vermeyen
 * Freelancer" admin stat from ~10.5k to ~1.2k.
 *
 * Reads the local database to find which uzman emails currently have zero gigs (this
 * script only emits SQL, so it needs the actual current state — unlike the earlier
 * scale-up scripts, which computed everything offline). For each such email, the index
 * baked into the address (uzmanN@…) maps straight back to generateSyntheticFreelancers'
 * array, so the gig it builds always matches the title/skills/category that email's
 * profile was already written with.
 *
 * Gig ids/slugs continue the "bump-N" numbering from 2927 (the last one the 3x scale-up
 * migration used), so nothing collides with gigs already in the database.
 *
 * Not meant to run against a live database — it only emits SQL into prisma/migrations/,
 * which `prisma migrate deploy` then applies.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateSyntheticFreelancers } from "../prisma/synthetic-freelancers";
import { buildGigForSyntheticFreelancer } from "../prisma/named-freelancers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TARGET_NO_GIG_COUNT = 1248;
const PREVIOUS_BUMP_GIG_COUNT = 2927;

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function packageRow(gigId: string, pkg: { tier: string; name: string; description: string; price: number; deliveryDays: number; revisionCount: number }, id: string) {
  return (
    `  (${quote(id)}, ${quote(pkg.tier)}::"PackageTier", ${quote(pkg.name)}, ${quote(pkg.description)}, ` +
    `${pkg.price}, ${pkg.deliveryDays}, ${pkg.revisionCount}, ${quote(gigId)})`
  );
}

async function main() {
  const noGigUsers = await prisma.user.findMany({
    where: {
      role: "FREELANCER",
      email: { startsWith: "uzman", endsWith: "@demo.prosinta.com" },
      gigs: { none: {} },
    },
    select: { email: true },
  });

  const withIndex = noGigUsers
    .map((u) => {
      const match = u.email.match(/^uzman(\d+)@demo\.prosinta\.com$/);
      if (!match) return null;
      return { email: u.email, index: Number(match[1]) };
    })
    .filter((v): v is { email: string; index: number } => v !== null)
    .sort((a, b) => a.index - b.index);

  const otherNoGigCount = await prisma.user.count({
    where: {
      role: "FREELANCER",
      NOT: { email: { startsWith: "uzman", endsWith: "@demo.prosinta.com" } },
      gigs: { none: {} },
    },
  });

  const toFill = withIndex.length - (TARGET_NO_GIG_COUNT - otherNoGigCount);
  if (toFill <= 0) {
    console.log(`Nothing to do: already at or below target (${otherNoGigCount} non-uzman + ${withIndex.length} uzman without a gig).`);
    return;
  }
  const chosen = withIndex.slice(0, toFill);

  const allSynthetic = generateSyntheticFreelancers(13398);
  const bumpGigs = chosen.map(({ email, index }, i) => {
    const person = allSynthetic[index - 1];
    if (person.email !== email) throw new Error(`index mismatch for ${email}: got ${person.email}`);
    return { person, gig: buildGigForSyntheticFreelancer(person, PREVIOUS_BUMP_GIG_COUNT + i) };
  });

  const sql =
    `-- "İlan Vermeyen Freelancer" sayısını (o an ~10.5k) hedefe (${TARGET_NO_GIG_COUNT}) çeker:\n` +
    `-- sentetik "uzman" havuzunda henüz ilanı olmayan ${withIndex.length} kişiden ${bumpGigs.length}\n` +
    `-- tanesine bir ilan verir, geri kalan ${withIndex.length - bumpGigs.length} uzman + ${otherNoGigCount}\n` +
    `-- diğer (isimli/vitrin) profil ilansız kalır.\n` +
    `--\n` +
    `-- scripts/emit-fill-freelancer-gigs.ts tarafından üretildi. id/slug numaralandırması\n` +
    `-- önceki bump-1..bump-2927'nin üzerine ${PREVIOUS_BUMP_GIG_COUNT + 1}'den devam eder.\n\n` +
    `INSERT INTO "gigs" ("id", "slug", "title", "description", "coverColor", "published", "sellerId", "categoryId", "createdAt", "updatedAt")\n` +
    `SELECT v.id, v.slug, v.title, v.description, v.cover_color, true, u.id, c.id, now(), now()\n` +
    `FROM (VALUES\n` +
    bumpGigs
      .map(
        ({ person, gig }, i) =>
          `  (${quote(`bump-gig-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(5, "0")}`)}, ${quote(gig.slug)}, ${quote(gig.title)}, ` +
          `${quote(gig.description)}, ${quote(gig.coverColor)}, ${quote(person.email)}, ${quote(gig.categorySlug)})`
      )
      .join(",\n") +
    `\n) AS v(id, slug, title, description, cover_color, seller_email, category_slug)\n` +
    `JOIN "users" u ON u.email = v.seller_email\n` +
    `JOIN "categories" c ON c.slug = v.category_slug\n` +
    `ON CONFLICT ("id") DO NOTHING;\n\n` +
    `INSERT INTO "packages" ("id", "tier", "name", "description", "price", "deliveryDays", "revisionCount", "gigId")\nVALUES\n` +
    bumpGigs
      .flatMap(({ gig }, i) => {
        const gigId = `bump-gig-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(5, "0")}`;
        return gig.packages.map((pkg, ti) =>
          packageRow(gigId, pkg, `bump-pkg-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(5, "0")}-${ti}`)
        );
      })
      .join(",\n") +
    `\nON CONFLICT ("id") DO NOTHING;\n`;

  const dir = "/home/user/Pazaryeri/prisma/migrations/20260909100000_fill_freelancer_gigs_to_1248_without";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);
  console.log(
    `wrote ${bumpGigs.length} gigs (${bumpGigs.length * 3} packages). ` +
      `No-gig after: ${withIndex.length - bumpGigs.length} uzman + ${otherNoGigCount} other = ${withIndex.length - bumpGigs.length + otherNoGigCount}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
