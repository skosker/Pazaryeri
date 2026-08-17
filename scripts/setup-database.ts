import "dotenv/config";
import { execFileSync } from "node:child_process";

/**
 * Brings an empty database up to a working state.
 *
 * Six early migrations seed demo content by INSERTing gigs, subcategories, reviews
 * and package tiers that reference sellers and categories by sub-select. Those rows
 * only exist after the seed has run, so on an empty database the sub-selects return
 * NULL and the inserts fail on NOT NULL constraints. The migrations cannot be edited
 * — they are already applied in deployed environments, and changing a migration after
 * the fact makes Prisma reject the whole history as drifted.
 *
 * Everything those six migrations insert is also produced by prisma/seed.ts, so a
 * fresh install marks them as applied without running them and lets the seed do the
 * work. Deployed databases are unaffected: they applied these migrations back when
 * the rows did exist, and `migrate resolve` is skipped for anything already recorded.
 */
const DATA_ONLY_MIGRATIONS = [
  "20260807133155_seed_all_category_gigs",
  "20260807140407_bulk_gigs_50_per_category",
  "20260810073022_seed_subcategories",
  "20260810090945_expand_bulk_catalog",
  "20260810140000_seed_freelancer_reviews",
  "20260810150000_add_package_tiers",
];

function run(args: string[], allowFailure = false) {
  try {
    execFileSync("npx", args, { stdio: "inherit" });
    return true;
  } catch (error) {
    if (allowFailure) return false;
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL tanımlı değil.");
    process.exit(1);
  }

  console.log("Veri ekleyen eski migration'lar atlanıyor (seed aynı içeriği üretiyor)...");
  for (const name of DATA_ONLY_MIGRATIONS) {
    // Fails when the migration is already recorded, which is the normal case on any
    // database that is not empty — nothing to do there.
    run(["prisma", "migrate", "resolve", "--applied", name], true);
  }

  console.log("\nMigration'lar uygulanıyor...");
  run(["prisma", "migrate", "deploy"]);

  console.log("\nDemo içerik yükleniyor...");
  run(["tsx", "prisma/seed.ts"]);

  console.log("\nVeritabanı hazır.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
