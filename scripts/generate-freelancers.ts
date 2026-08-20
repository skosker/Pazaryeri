import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  generateSyntheticFreelancers,
  SYNTHETIC_FREELANCER_COUNT,
  SYNTHETIC_PASSWORD_HASH,
  type SyntheticFreelancer,
} from "../prisma/synthetic-freelancers";
import { loadShowcaseOffers, showcaseFreelancers } from "../prisma/showcase-freelancers";
import {
  syncShowcaseFreelancers,
  syncSyntheticFreelancers,
} from "../prisma/sync-synthetic-freelancers";
import type { ShowcaseProfile } from "../prisma/synthetic-freelancers";

/**
 * Writes the generated freelancer profiles into the database.
 *
 *   npm run freelancer:uret                  # 1000 profil oluşturur, var olanları tazeler
 *   npm run freelancer:uret -- --dry-run     # hiçbir şey yazmadan ne olacağını gösterir
 *   npm run freelancer:uret -- --adet=50     # daha küçük bir set
 *   npm run freelancer:uret -- --sql         # 1000 profilin migration SQL'ini basar
 *   npm run freelancer:uret -- --sql-vitrin  # eski demo satıcıların migration SQL'ini basar
 *                                            # (ilanlara baktığı için veritabanı ister)
 *
 * The profiles are a pure function of their index (prisma/synthetic-freelancers.ts), so
 * running this twice updates the same thousand rows instead of adding a second thousand.
 * Only rows flagged `synthetic` are written: an e-mail that belongs to a real account is
 * reported and left exactly as it is.
 *
 * A normal run also completes the demo sellers that predate the generator (the named
 * ones and fl1..fl200): they keep their name, title and listings and get the profile
 * details filled in, so the directory does not show half-finished profiles next to the
 * generated ones.
 */

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const asSql = args.includes("--sql");
const asShowcaseSql = args.includes("--sql-vitrin");
const countArg = args.find((arg) => arg.startsWith("--adet=") || arg.startsWith("--count="));
const count = countArg ? Number(countArg.split("=")[1]) : SYNTHETIC_FREELANCER_COUNT;

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlRow(person: SyntheticFreelancer) {
  const skills = person.skills.map(quote).join(", ");
  return (
    `  (${quote(person.email)}, ${quote(person.name)}, ${quote(person.title)}, ` +
    `${quote(person.city)}, ${person.age}, ARRAY[${skills}]::text[], ${quote(person.image)}, ` +
    `${quote(person.bio)}, ${person.isOnline}, ${person.isPro})`
  );
}

/** The whole run as one statement, for the migration that ships these to deployments. */
function printSql(people: SyntheticFreelancer[]) {
  console.log(
    `-- ${people.length} üretilmiş freelancer profili.\n` +
      `-- prisma/synthetic-freelancers.ts tarafından üretildi: yeniden üretmek için\n` +
      `--   npm run freelancer:uret -- --sql\n` +
      `-- Parolalar bilerek kullanılamaz durumda: bunlar vitrin profilleri, giriş yapılan\n` +
      `-- hesaplar değil. bcrypt.compare böyle bir değer için hata vermeden false döner.\n`
  );
  console.log(
    'INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "title", "city", "age", ' +
      '"skills", "image", "bio", "emailVerified", "suspended", "isOnline", "isPro", "synthetic", ' +
      '"createdAt", "updatedAt")\nSELECT\n  gen_random_uuid()::text,\n  v.name,\n  v.email,\n' +
      `  ${quote(SYNTHETIC_PASSWORD_HASH)},\n  'FREELANCER'::"Role",\n  v.title,\n  v.city,\n  v.age,\n` +
      "  v.skills,\n  v.image,\n  v.bio,\n  now(),\n  false,\n  v.is_online,\n  v.is_pro,\n  true,\n" +
      "  now(),\n  now()\nFROM (VALUES"
  );
  console.log(people.map(sqlRow).join(",\n"));
  console.log(
    ') AS v(email, name, title, city, age, skills, image, bio, is_online, is_pro)\n' +
      'ON CONFLICT ("email") DO NOTHING;'
  );
}

/** The backfill for the older demo sellers, as one statement. */
function printShowcaseSql(people: ShowcaseProfile[]) {
  console.log(
    `-- Generatörden önce var olan ${people.length} demo satıcının profilini tamamlar:\n` +
      `-- yaş, şehir, uzmanlık, çizilen profil fotoğrafı ve tanıtım metni. İsim, meslek ve\n` +
      `-- ilanlar olduğu gibi kalır. prisma/synthetic-freelancers.ts tarafından üretildi:\n` +
      `--   npm run freelancer:uret -- --sql-vitrin\n`
  );
  console.log('UPDATE "users" AS u SET');
  console.log(
    '  "city" = v.city,\n  "age" = v.age,\n  "skills" = v.skills,\n' +
      // Only fills a photo in where there is none: a profile that already has a real
      // portrait from the photo run must not be pushed back to a drawn avatar.
      '  "image" = COALESCE(u."image", v.image),\n' +
      '  "bio" = v.bio,\n  "synthetic" = true,\n  "updatedAt" = now()\nFROM (VALUES'
  );
  console.log(
    people
      .map(
        (person) =>
          `  (${quote(person.email)}, ${quote(person.city)}, ${person.age}, ` +
          `ARRAY[${person.skills.map(quote).join(", ")}]::text[], ${quote(person.image)}, ` +
          `${quote(person.bio)})`
      )
      .join(",\n")
  );
  console.log(
    ') AS v(email, city, age, skills, image, bio)\nWHERE u."email" = v.email AND u."role" = \'FREELANCER\';'
  );
}

async function run() {
  const people = generateSyntheticFreelancers(count);

  if (asSql) {
    printSql(people);
    return;
  }

  if (asShowcaseSql) {
    // Needs the database: what each showcase seller lists decides their expertise.
    printShowcaseSql(showcaseFreelancers(await loadShowcaseOffers(prisma)));
    return;
  }

  if (dryRun) {
    console.log(
      `${people.length} profil üretildi, ${showcaseFreelancers().length} eski demo satıcı ` +
        `tamamlanacak. --dry-run: hiçbir şey yazılmadı.\n`
    );
    console.log("Örnek profiller:\n");
    for (const person of people.slice(0, 3)) {
      console.log(
        `  ${person.name} · ${person.title} · ${person.age} · ${person.city}\n` +
          `    uzmanlık: ${person.skills.join(", ")}\n` +
          `    fotoğraf: ${person.image}`
      );
    }
    return;
  }

  const { created, updated, skipped } = await syncSyntheticFreelancers(
    prisma,
    people,
    (done, total) => {
      if (done % 200 === 0 || done === total) console.log(`  ${done}/${total} profil yazıldı`);
    }
  );

  console.log(
    `${people.length} profil · ${created} yeni · ${updated} tazelendi` +
      `${skipped.length > 0 ? ` · ${skipped.length} gerçek hesap atlandı` : ""}`
  );

  if (skipped.length > 0) {
    console.log(
      `\nBu e-postalar gerçek hesaplara ait, dokunulmadı: ` +
        `${skipped.slice(0, 5).join(", ")}${skipped.length > 5 ? ` (+${skipped.length - 5})` : ""}`
    );
  }

  const showcase = await syncShowcaseFreelancers(
    prisma,
    showcaseFreelancers(await loadShowcaseOffers(prisma))
  );
  console.log(`${showcase.updated} eski demo satıcı profili tamamlandı`);

  const total = await prisma.user.count({ where: { synthetic: true } });
  console.log(`\nBitti: veritabanında ${total} üretilmiş freelancer profili var.`);
}

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
