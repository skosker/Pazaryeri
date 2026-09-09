/**
 * One-off driver that writes migration.sql files for a second platform scale-up: the
 * synthetic freelancer pool widened again (1000 -> 4466 -> 13398, i.e. 3x the previous
 * size) plus gigs for a slice of the newly added range. Not meant to run against a live
 * database — it only emits SQL into prisma/migrations/, which `prisma migrate deploy`
 * then applies.
 *
 * Mirrors emit-scale-up-migration.ts's freelancer/gig steps, with two differences to
 * avoid colliding with what that migration already wrote:
 *   - the user INSERT covers the full new count (0..13397); ON CONFLICT DO NOTHING skips
 *     every uzman1..uzman4466 row that already exists, exactly like last time.
 *   - the gig/package ids and slug suffixes continue counting from where the previous
 *     bump left off (820..) instead of restarting at 1, since "bump-1"/"bump-gig-0001"
 *     etc. are already taken.
 */

import { writeFileSync } from "fs";
import { generateSyntheticFreelancers } from "../prisma/synthetic-freelancers";
import { buildGigForSyntheticFreelancer } from "../prisma/named-freelancers";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

// ---------- 1) Widened synthetic freelancer pool (all 13398; existing ones no-op) ----------
const allSynthetic = generateSyntheticFreelancers(13398);

const bumpUsersSql =
  `-- Üretilmiş freelancer havuzunu 4466'dan 13398'e genişletir (3 kat, yeni 8932 profil).\n` +
  `--\n` +
  `-- prisma/synthetic-freelancers.ts ile aynı üreteç, sadece SYNTHETIC_FREELANCER_COUNT\n` +
  `-- büyütülüp yeniden çalıştırıldı (npm run freelancer:uret -- --sql). İlk 4466 kişi de\n` +
  `-- listede var ama ON CONFLICT ile atlanır; yalnızca 4467-13398 arası yeni eklenir.\n\n` +
  `INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "city", "age", ` +
  `"skills", "image", "bio", "emailVerified", "suspended", "isOnline", "isPro", "synthetic", ` +
  `"createdAt", "updatedAt")\n` +
  `SELECT gen_random_uuid()::text, v.name, v.email, '!showcase-profile-no-login', 'FREELANCER'::"Role", ` +
  `v.title, v.city, v.age, v.skills, v.image, v.bio, now(), false, v.is_online, v.is_pro, true, now(), now()\n` +
  `FROM (VALUES\n` +
  allSynthetic
    .map(
      (p) =>
        `  (${quote(p.email)}, ${quote(p.name)}, ${quote(p.title)}, ${quote(p.city)}, ${p.age}, ` +
        `ARRAY[${p.skills.map(quote).join(", ")}]::text[], ${quote(p.image)}, ${quote(p.bio)}, ` +
        `${p.isOnline}, ${p.isPro})`
    )
    .join(",\n") +
  `\n) AS v(email, name, title, city, age, skills, image, bio, is_online, is_pro)\n` +
  `ON CONFLICT ("email") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260909060000_bump_synthetic_freelancers_3x/migration.sql",
  bumpUsersSql
);
console.log("bump toplam:", allSynthetic.length, "(yeni 8932)");

function packageRow(gigId: string, pkg: { tier: string; name: string; description: string; price: number; deliveryDays: number; revisionCount: number }, id: string) {
  return (
    `  (${quote(id)}, ${quote(pkg.tier)}::"PackageTier", ${quote(pkg.name)}, ${quote(pkg.description)}, ` +
    `${pkg.price}, ${pkg.deliveryDays}, ${pkg.revisionCount}, ${quote(gigId)})`
  );
}

// ---------- 2) Gigs for a slice of the newly added range ----------
// Same ~23.6% share of the newly added pool as the previous bump (819 of 3466), applied
// to this round's 8932 new profiles: 2108. Continues the "bump-N" index from 819 so
// slugs and ids do not collide with the gigs that migration already inserted.
const PREVIOUS_BUMP_GIG_COUNT = 819;
const newRange = allSynthetic.slice(4466, 4466 + 2108); // uzman4467..uzman6574
const bumpGigs = newRange.map((person, i) => ({
  person,
  gig: buildGigForSyntheticFreelancer(person, PREVIOUS_BUMP_GIG_COUNT + i),
}));

const bumpGigsSql =
  `-- İkinci genişletmede eklenen sentetik havuzun bir dilimine ilan verir (819 numaradan\n` +
  `-- devam eder, önceki genişletmenin bump-1..bump-819 id/slug'larıyla çakışmaz).\n\n` +
  `INSERT INTO "gigs" ("id", "slug", "title", "description", "coverColor", "published", "sellerId", "categoryId", "createdAt", "updatedAt")\n` +
  `SELECT v.id, v.slug, v.title, v.description, v.cover_color, true, u.id, c.id, now(), now()\n` +
  `FROM (VALUES\n` +
  bumpGigs
    .map(
      ({ person, gig }, i) =>
        `  (${quote(`bump-gig-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(4, "0")}`)}, ${quote(gig.slug)}, ${quote(gig.title)}, ` +
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
      const gigId = `bump-gig-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(4, "0")}`;
      return gig.packages.map((pkg, ti) =>
        packageRow(gigId, pkg, `bump-pkg-${String(PREVIOUS_BUMP_GIG_COUNT + i + 1).padStart(4, "0")}-${ti}`)
      );
    })
    .join(",\n") +
  `\nON CONFLICT ("id") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260909070000_bump_freelancer_gigs_3x/migration.sql",
  bumpGigsSql
);
console.log("bump gig:", bumpGigs.length, ", paket:", bumpGigs.length * 3);
