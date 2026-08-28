/**
 * One-off driver that writes migration.sql files for a bulk platform scale-up: named
 * freelancer profiles tied to a payout ledger, a widened synthetic freelancer pool, gigs
 * for a slice of that pool, and matching synthetic buyers. Not meant to run against a
 * live database — it only emits SQL into prisma/migrations/, which `prisma migrate
 * deploy` then applies. Re-running this script overwrites those specific migration files
 * with fresh output from the current generators; edit the target paths/counts below
 * before running it again for a different scale-up.
 */

import { writeFileSync } from "fs";
import {
  generateSyntheticFreelancers,
  SYNTHETIC_PASSWORD_HASH,
} from "../prisma/synthetic-freelancers";
import { generateNamedFreelancers, buildGigForSyntheticFreelancer } from "../prisma/named-freelancers";
import { generateSyntheticBuyers } from "../prisma/synthetic-buyers";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

// ---------- 1) Named freelancers: users + gigs + packages ----------
const named = generateNamedFreelancers();

const namedUsersSql =
  `-- 161 gerçek isimli freelancer profili (hakediş ödemesi olanlar).\n` +
  `--\n` +
  `-- prisma/named-freelancers.ts tarafından üretildi. Sentetik profillerle aynı model:\n` +
  `-- yaş/şehir/uzmanlık/biyografi/çizilen avatar isimden ve e-postadan türetilir; giriş\n` +
  `-- kapalı (bu bir vitrin profili, gerçek hesap değil).\n\n` +
  `INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "city", "age", ` +
  `"skills", "image", "bio", "emailVerified", "suspended", "isOnline", "isPro", "synthetic", ` +
  `"createdAt", "updatedAt")\n` +
  `SELECT gen_random_uuid()::text, v.name, v.email, ${quote(SYNTHETIC_PASSWORD_HASH)}, 'FREELANCER'::"Role", ` +
  `v.title, v.city, v.age, v.skills, v.image, v.bio, now(), false, v.is_online, v.is_pro, true, now(), now()\n` +
  `FROM (VALUES\n` +
  named
    .map(
      (p) =>
        `  (${quote(p.email)}, ${quote(p.name)}, ${quote(p.title)}, ${quote(p.city)}, ${p.age}, ` +
        `ARRAY[${p.skills.map(quote).join(", ")}]::text[], ${quote(p.image)}, ${quote(p.bio)}, ` +
        `${p.isOnline}, ${p.isPro})`
    )
    .join(",\n") +
  `\n) AS v(email, name, title, city, age, skills, image, bio, is_online, is_pro)\n` +
  `ON CONFLICT ("email") DO NOTHING;\n`;

function packageRow(gigId: string, pkg: { tier: string; name: string; description: string; price: number; deliveryDays: number; revisionCount: number }, id: string) {
  return (
    `  (${quote(id)}, ${quote(pkg.tier)}::"PackageTier", ${quote(pkg.name)}, ${quote(pkg.description)}, ` +
    `${pkg.price}, ${pkg.deliveryDays}, ${pkg.revisionCount}, ${quote(gigId)})`
  );
}

const namedGigsSql =
  `-- Her gerçek isimli freelancer için bir ilan: standart paket fiyatı hakediş tutarına\n` +
  `-- eşit (yuvarlanmış). Satıcı, bir önceki adımda eklenen kullanıcı satırına e-posta\n` +
  `-- üzerinden bağlanır.\n\n` +
  `INSERT INTO "gigs" ("id", "slug", "title", "description", "coverColor", "published", "sellerId", "categoryId", "createdAt", "updatedAt")\n` +
  `SELECT v.id, v.slug, v.title, v.description, v.cover_color, true, u.id, c.id, now(), now()\n` +
  `FROM (VALUES\n` +
  named
    .map(
      (p, i) =>
        `  (${quote(`named-gig-${String(i + 1).padStart(4, "0")}`)}, ${quote(p.gig.slug)}, ${quote(p.gig.title)}, ` +
        `${quote(p.gig.description)}, ${quote(p.gig.coverColor)}, ${quote(p.email)}, ${quote(p.gig.categorySlug)})`
    )
    .join(",\n") +
  `\n) AS v(id, slug, title, description, cover_color, seller_email, category_slug)\n` +
  `JOIN "users" u ON u.email = v.seller_email\n` +
  `JOIN "categories" c ON c.slug = v.category_slug\n` +
  `ON CONFLICT ("id") DO NOTHING;\n\n` +
  `INSERT INTO "packages" ("id", "tier", "name", "description", "price", "deliveryDays", "revisionCount", "gigId")\nVALUES\n` +
  named
    .flatMap((p, i) => {
      const gigId = `named-gig-${String(i + 1).padStart(4, "0")}`;
      return p.gig.packages.map((pkg, ti) => packageRow(gigId, pkg, `named-pkg-${String(i + 1).padStart(4, "0")}-${ti}`));
    })
    .join(",\n") +
  `\nON CONFLICT ("id") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260827190000_named_freelancer_profiles/migration.sql",
  namedUsersSql + "\n" + namedGigsSql
);
console.log("named:", named.length, "freelancer,", named.length, "gig,", named.length * 3, "paket");

// ---------- 2) Bumped synthetic freelancer pool (all 4466; existing ones no-op) ----------
const allSynthetic = generateSyntheticFreelancers(4466);

const bumpUsersSql =
  `-- Üretilmiş freelancer havuzunu 1000'den 4466'ya genişletir (yeni 3466 profil).\n` +
  `--\n` +
  `-- prisma/synthetic-freelancers.ts ile aynı üreteç, sadece SYNTHETIC_FREELANCER_COUNT\n` +
  `-- büyütülüp yeniden çalıştırıldı (npm run freelancer:uret -- --sql). İlk 1000 kişi de\n` +
  `-- listede var ama ON CONFLICT ile atlanır; yalnızca 1001-4466 arası yeni eklenir.\n\n` +
  `INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "city", "age", ` +
  `"skills", "image", "bio", "emailVerified", "suspended", "isOnline", "isPro", "synthetic", ` +
  `"createdAt", "updatedAt")\n` +
  `SELECT gen_random_uuid()::text, v.name, v.email, ${quote(SYNTHETIC_PASSWORD_HASH)}, 'FREELANCER'::"Role", ` +
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
  "/home/user/Pazaryeri/prisma/migrations/20260827200000_bump_synthetic_freelancers/migration.sql",
  bumpUsersSql
);
console.log("bump toplam:", allSynthetic.length, "(yeni ~3466)");

// ---------- 3) Gigs for the first 819 of the newly added synthetic range ----------
const newRange = allSynthetic.slice(1000, 1000 + 819); // uzman1001..uzman1819
const bumpGigs = newRange.map((p, i) => ({ person: p, gig: buildGigForSyntheticFreelancer(p, i) }));

const bumpGigsSql =
  `-- Genişletilen sentetik havuzun ilk 819 kişisine bir ilan verir (geri kalanı, ilk\n` +
  `-- bindeki gibi yalnızca profil olarak kalır). Fiyat, o kategorinin olağan aralığından\n` +
  `-- seçilir (bulk-gigs-data.ts'teki bantların aynısı).\n\n` +
  `INSERT INTO "gigs" ("id", "slug", "title", "description", "coverColor", "published", "sellerId", "categoryId", "createdAt", "updatedAt")\n` +
  `SELECT v.id, v.slug, v.title, v.description, v.cover_color, true, u.id, c.id, now(), now()\n` +
  `FROM (VALUES\n` +
  bumpGigs
    .map(
      ({ person, gig }, i) =>
        `  (${quote(`bump-gig-${String(i + 1).padStart(4, "0")}`)}, ${quote(gig.slug)}, ${quote(gig.title)}, ` +
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
      const gigId = `bump-gig-${String(i + 1).padStart(4, "0")}`;
      return gig.packages.map((pkg, ti) => packageRow(gigId, pkg, `bump-pkg-${String(i + 1).padStart(4, "0")}-${ti}`));
    })
    .join(",\n") +
  `\nON CONFLICT ("id") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260827210000_bump_freelancer_gigs/migration.sql",
  bumpGigsSql
);
console.log("bump gig:", bumpGigs.length, ", paket:", bumpGigs.length * 3);

// ---------- 4) Synthetic buyers ----------
const buyers = generateSyntheticBuyers(966);
const buyersSql =
  `-- Kullanıcı sayısını freelancer büyümesiyle orantılı tutmak için 966 yeni alıcı.\n` +
  `--\n` +
  `-- prisma/synthetic-buyers.ts tarafından üretildi: yalnızca isim, profil sayfası yok.\n` +
  `-- Giriş kapalı (vitrin hesabı).\n\n` +
  `INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "emailVerified", "suspended", "synthetic", "createdAt", "updatedAt")\n` +
  `SELECT gen_random_uuid()::text, v.name, v.email, ${quote(SYNTHETIC_PASSWORD_HASH)}, 'BUYER'::"Role", now(), false, true, now(), now()\n` +
  `FROM (VALUES\n` +
  buyers.map((b) => `  (${quote(b.email)}, ${quote(b.name)})`).join(",\n") +
  `\n) AS v(email, name)\n` +
  `ON CONFLICT ("email") DO NOTHING;\n`;

writeFileSync(
  "/home/user/Pazaryeri/prisma/migrations/20260827220000_synthetic_buyers/migration.sql",
  buyersSql
);
console.log("buyer:", buyers.length);
