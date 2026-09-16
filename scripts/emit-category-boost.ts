/**
 * One-off driver that writes a migration.sql adding more freelancers+gigs to specific
 * categories only. The existing generator hands out professions round-robin over all
 * ten categories on purpose ("every category stays equally staffed" — see
 * prisma/synthetic-freelancers.ts), which is exactly why every category ended up with
 * almost the same listing count. Real marketplaces are not flat like that: some
 * categories (Yazılım & Web, Grafik Tasarım, …) are simply bigger than others (Müzik &
 * Ses). This tops up only the categories that should be bigger, leaving every existing
 * row untouched — purely additive, like every other scale-up migration this session.
 *
 * Not meant to run against a live database — it only emits SQL into prisma/migrations/,
 * which `prisma migrate deploy` then applies.
 */

import { writeFileSync } from "fs";
import {
  hash32,
  reader,
  pickSome,
  pickCity,
  professions,
  buildBio,
  SYNTHETIC_PASSWORD_HASH,
  type SyntheticFreelancer,
} from "../prisma/synthetic-freelancers";
import { buildGig, categoryPriceBands } from "../prisma/named-freelancers";
import { drawnAvatarUrl } from "../src/lib/avatar-seed";
import { feminineNames, masculineNames } from "../src/lib/turkish-names";

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function packageRow(
  gigId: string,
  pkg: { tier: string; name: string; description: string; price: number; deliveryDays: number; revisionCount: number },
  id: string
) {
  return (
    `  (${quote(id)}, ${quote(pkg.tier)}::"PackageTier", ${quote(pkg.name)}, ${quote(pkg.description)}, ` +
    `${pkg.price}, ${pkg.deliveryDays}, ${pkg.revisionCount}, ${quote(gigId)})`
  );
}

// How many more freelancer+gig pairs each category gets, on top of what it already has.
// Weighted toward the categories a real freelance marketplace would expect to be
// biggest; the categories left out (İş & Danışmanlık, Eğitim & Ders, Veri & Analitik,
// Müzik & Ses) stay exactly as they are — smaller and more niche is realistic too.
const BOOSTS: { categorySlug: string; count: number }[] = [
  { categorySlug: "yazilim-web", count: 840 },
  { categorySlug: "grafik-tasarim", count: 916 },
  { categorySlug: "dijital-pazarlama", count: 516 },
  { categorySlug: "yazi-ceviri", count: 396 },
  { categorySlug: "ai-otomasyon", count: 186 },
  { categorySlug: "video-animasyon", count: 68 },
];

const EMAIL_PREFIX = "catboost";
const EMAIL_DOMAIN = "demo.prosinta.com";

const usedNames = new Set<string>();
const people: SyntheticFreelancer[] = [];

let globalIndex = 0;
for (const { categorySlug, count } of BOOSTS) {
  const categoryProfessions = professions.filter((p) => p.categorySlug === categorySlug);
  if (categoryProfessions.length === 0) throw new Error(`Bilinmeyen kategori: ${categorySlug}`);

  for (let i = 0; i < count; i++, globalIndex++) {
    const email = `${EMAIL_PREFIX}${globalIndex + 1}@${EMAIL_DOMAIN}`;
    const r = reader(hash32(email));
    const profession = categoryProfessions[i % categoryProfessions.length];

    const feminine = r(2) === 0;
    const firstNamePool = feminine ? feminineNames : masculineNames;
    let firstNameIndex = r(firstNamePool.length);
    // A local surname pool rather than importing the base generator's private list —
    // collisions are resolved the same way it does, by walking forward.
    const surnames = professionSurnamesFallback();
    let surnameIndex = r(surnames.length);
    let name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;
    for (let taken = 0; usedNames.has(name); taken++) {
      surnameIndex = (surnameIndex + 1) % surnames.length;
      if (taken > 0 && taken % surnames.length === 0) {
        firstNameIndex = (firstNameIndex + 1) % firstNamePool.length;
      }
      name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;
    }
    usedNames.add(name);

    const age = 22 + Math.min(r(37), r(37));
    const city = pickCity(r);
    const skills = pickSome(profession.skills, 3 + r(3), r);
    const years = Math.max(1, Math.min(age - 21, 2 + r(13)));

    people.push({
      email,
      name,
      title: profession.title,
      age,
      city: city.name,
      skills,
      image: drawnAvatarUrl(name, email),
      bio: buildBio(name.split(" ")[0], profession.title, years, skills, r),
      categorySlug,
      isOnline: r(3) === 0,
      isPro: r(9) === 0,
    });
  }
}

// A small, self-contained surname pool for this batch — avoids importing the base
// generator's private list and keeps this script standalone.
function professionSurnamesFallback() {
  return [
    "Yıldız", "Kaya", "Demir", "Çelik", "Şahin", "Aydın", "Öztürk", "Arslan", "Doğan", "Kılıç",
    "Aslan", "Çetin", "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Bulut", "Aksoy", "Güneş",
    "Yıldırım", "Türk", "Erdoğan", "Toprak", "Karaca", "Tan", "Uçar", "Ekşi", "Balcı", "Sönmez",
  ] as const;
}

// buildGigForSyntheticFreelancer hardcodes its slug suffix as `bump-${index}`, which
// would collide with the (much larger) index range the earlier scale-up migrations
// already used that same suffix for. Calling buildGig directly with a `catboost-`
// suffix keeps this batch's slugs in their own namespace.
const gigs = people.map((person, i) => {
  const band = categoryPriceBands[person.categorySlug] ?? { min: 1000, max: 8000 };
  const r = reader(hash32(`band:${person.email}`));
  const standardPrice = band.min + r(band.max - band.min);
  const years = Math.max(1, Math.min(person.age - 21, 2 + r(13)));
  const gig = buildGig(
    person.email,
    i,
    person.title,
    person.skills,
    years,
    person.categorySlug,
    standardPrice,
    `catboost-${i + 1}`
  );
  return { person, gig };
});

const usersSql =
  `-- Kategori başına ilan sayısını gerçekçi hale getirmek için hedefli takviye: mevcut\n` +
  `-- round-robin üreteç her kategoriyi eşit doldurduğundan (bkz. synthetic-freelancers.ts),\n` +
  `-- gerçek bir pazaryerinde daha büyük olması beklenen kategorilere (Yazılım & Web,\n` +
  `-- Grafik Tasarım, Dijital Pazarlama, Yazı & Çeviri, AI & Otomasyon, Video & Animasyon)\n` +
  `-- ek ${people.length} freelancer+ilan eklenir. Var olan hiçbir satıra dokunulmaz.\n\n` +
  `INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "city", "age", ` +
  `"skills", "image", "bio", "emailVerified", "suspended", "isOnline", "isPro", "synthetic", ` +
  `"createdAt", "updatedAt")\n` +
  `SELECT gen_random_uuid()::text, v.name, v.email, ${quote(SYNTHETIC_PASSWORD_HASH)}, 'FREELANCER'::"Role", ` +
  `v.title, v.city, v.age, v.skills, v.image, v.bio, now(), false, v.is_online, v.is_pro, true, now(), now()\n` +
  `FROM (VALUES\n` +
  people
    .map(
      (p) =>
        `  (${quote(p.email)}, ${quote(p.name)}, ${quote(p.title)}, ${quote(p.city)}, ${p.age}, ` +
        `ARRAY[${p.skills.map(quote).join(", ")}]::text[], ${quote(p.image)}, ${quote(p.bio)}, ` +
        `${p.isOnline}, ${p.isPro})`
    )
    .join(",\n") +
  `\n) AS v(email, name, title, city, age, skills, image, bio, is_online, is_pro)\n` +
  `ON CONFLICT ("email") DO NOTHING;\n\n` +
  `INSERT INTO "gigs" ("id", "slug", "title", "description", "coverColor", "published", "sellerId", "categoryId", "createdAt", "updatedAt")\n` +
  `SELECT v.id, v.slug, v.title, v.description, v.cover_color, true, u.id, c.id, now(), now()\n` +
  `FROM (VALUES\n` +
  gigs
    .map(
      ({ person, gig }, i) =>
        `  (${quote(`catboost-gig-${String(i + 1).padStart(4, "0")}`)}, ${quote(gig.slug)}, ${quote(gig.title)}, ` +
        `${quote(gig.description)}, ${quote(gig.coverColor)}, ${quote(person.email)}, ${quote(gig.categorySlug)})`
    )
    .join(",\n") +
  `\n) AS v(id, slug, title, description, cover_color, seller_email, category_slug)\n` +
  `JOIN "users" u ON u.email = v.seller_email\n` +
  `JOIN "categories" c ON c.slug = v.category_slug\n` +
  `ON CONFLICT ("id") DO NOTHING;\n\n` +
  `INSERT INTO "packages" ("id", "tier", "name", "description", "price", "deliveryDays", "revisionCount", "gigId")\nVALUES\n` +
  gigs
    .flatMap(({ gig }, i) => {
      const gigId = `catboost-gig-${String(i + 1).padStart(4, "0")}`;
      return gig.packages.map((pkg, ti) => packageRow(gigId, pkg, `catboost-pkg-${String(i + 1).padStart(4, "0")}-${ti}`));
    })
    .join(",\n") +
  `\nON CONFLICT ("id") DO NOTHING;\n`;

writeFileSync("/home/user/Pazaryeri/prisma/migrations/20260916150000_category_listing_boost/migration.sql", usersSql);
console.log("toplam yeni freelancer+ilan:", people.length);
for (const { categorySlug, count } of BOOSTS) {
  console.log(" ", categorySlug, "+", count);
}
