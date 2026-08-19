import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { photoQueryFor } from "../src/lib/cover-photo-queries";
import { assignCoverPhotos, coverPhotoProgress, PEXELS_HOST } from "../src/lib/cover-photos";

/**
 * Command-line front end for the cover-photo run. The same job is available as a button
 * in the admin panel (/admin/kapaklar); this is here for filling a fresh database from a
 * terminal, and for --dry-run, which shows the search terms without spending any quota.
 *
 *   npm run kapak:fotograf -- --dry-run   # what would be searched, changes nothing
 *   npm run kapak:fotograf                # fill in every listing without a photo
 *   npm run kapak:fotograf -- --force     # re-draw photos for all of them
 *
 * Needs PEXELS_API_KEY (free, https://www.pexels.com/api/) and DATABASE_URL.
 */

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

async function showPlan() {
  const gigs = await prisma.gig.findMany({
    select: { slug: true, title: true, coverImage: true, category: { select: { icon: true } } },
    orderBy: { slug: "asc" },
  });

  const targets = gigs.filter(
    (gig) =>
      (gig.coverImage === null || gig.coverImage.startsWith(PEXELS_HOST)) &&
      (force || gig.coverImage === null)
  );

  const byQuery = new Map<string, string[]>();
  for (const gig of targets) {
    const query = photoQueryFor(gig.category.icon, gig.slug);
    byQuery.set(query, [...(byQuery.get(query) ?? []), gig.title]);
  }

  console.log(`${gigs.length} ilan · ${targets.length} işlenecek · ${byQuery.size} farklı arama\n`);
  for (const [query, titles] of [...byQuery].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(titles.length).padStart(3)} × "${query}"  ör. ${titles[0]}`);
  }
}

async function run() {
  const start = await coverPhotoProgress();
  console.log(
    `${start.total} ilan · ${start.withPhoto} zaten fotoğraflı` +
      `${start.sellerUploads ? ` · ${start.sellerUploads} satıcı yüklemesi korunuyor` : ""}`
  );

  const exhausted = new Set<string>();
  for (;;) {
    const batch = await assignCoverPhotos({ force, maxQueries: 8 });
    batch.exhausted.forEach((query) => exhausted.add(query));
    console.log(`  +${batch.assigned} fotoğraf · ${batch.pending} ilan kaldı`);

    // A batch that assigns nothing means every remaining term is out of unused photos.
    if (batch.pending === 0 || batch.assigned === 0) break;
  }

  const end = await coverPhotoProgress();
  console.log(`\nBitti: ${end.withPhoto} ilanın fotoğrafı var.`);
  if (exhausted.size > 0) {
    console.log(`Boşta fotoğraf kalmayan aramalar: ${[...exhausted].join(", ")}`);
  }
  console.log("Fotoğraflar Pexels'ten geliyor (pexels.com/license) ve CDN'den servis ediliyor.");
}

const job = dryRun ? showPlan() : run();

job
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
