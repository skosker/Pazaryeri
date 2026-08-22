import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  assignProfilePhotos,
  profilePhotoProgress,
  resetProfilePhotos,
} from "../src/lib/profile-photos";

/**
 * Command-line front end for the profile-photo run. The same job is a button in the
 * admin panel (/admin/profil-fotograflari); this is here for filling a database from a
 * terminal.
 *
 *   npm run profil:fotograf              # fotoğrafı olmayan profilleri doldur
 *   npm run profil:fotograf -- --force   # hepsini yeniden çek
 *   npm run profil:fotograf -- --sifirla # fotoğrafları bırakıp çizimlere dön
 *
 * Needs PEXELS_API_KEY (free, https://www.pexels.com/api/) and DATABASE_URL.
 */

const force = process.argv.slice(2).includes("--force");
const reset = process.argv.slice(2).includes("--sifirla");

async function run() {
  if (reset) {
    const { reset: count } = await resetProfilePhotos();
    console.log(`${count} profil çizilen avatara döndürüldü.`);
    console.log("Fotoğrafları istediğin zaman tekrar çekebilirsin: npm run profil:fotograf");
    return;
  }

  const start = await profilePhotoProgress();
  console.log(`${start.total} üretilmiş profil · ${start.withPhoto} zaten fotoğraflı`);

  const exhausted = new Set<string>();
  let startQuery = 0;
  let sweepFailures = 0;
  let retriedSweep = false;

  for (;;) {
    const batch = await assignProfilePhotos({ force, startQuery, maxQueries: 4 });
    batch.exhausted.forEach((query) => exhausted.add(query));
    sweepFailures += batch.failed.length;
    startQuery = batch.nextQuery;
    console.log(`  +${batch.assigned} fotoğraf · ${batch.pending} profil kaldı`);

    if (batch.rateLimited) {
      console.log(`\n${batch.rateLimited}`);
      break;
    }
    if (batch.pending === 0) break;

    if (batch.queriesRun === 0) {
      // The sweep is over. Searches that failed on the way may work now, so go round
      // once more for them — but not when every search simply ran out of photos.
      if (sweepFailures === 0 || retriedSweep) break;
      retriedSweep = true;
      sweepFailures = 0;
      startQuery = 0;
    }
  }

  const end = await profilePhotoProgress();
  console.log(`\nBitti: ${end.withPhoto} profilin gerçek portre fotoğrafı var.`);
  if (end.pending > 0) {
    console.log(`${end.pending} profil çizilen avatarla kalıyor.`);
  }
  if (exhausted.size > 0) {
    console.log(`Boşta fotoğraf kalmayan aramalar: ${[...exhausted].join(", ")}`);
  }
  console.log("Fotoğraflar Pexels'ten geliyor (pexels.com/license) ve CDN'den servis ediliyor.");
}

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
