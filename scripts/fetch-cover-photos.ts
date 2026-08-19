import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { photoQueryFor } from "../src/lib/cover-photo-queries";

/**
 * Gives every listing a real photograph as its cover.
 *
 * For each gig it works out an English search term from the words in the gig's own slug
 * (see cover-photo-queries.ts), searches Pexels for it and assigns a photo no other
 * listing on the site is using. What lands in `Gig.coverImage` is the Pexels CDN URL, not
 * the bytes: the Pexels licence allows serving their images directly, and 980 downloaded
 * photos would otherwise be ~150MB sitting in the database.
 *
 * Only covers this script owns are touched — a URL on the Pexels host, or nothing at
 * all. A cover a seller uploaded is never overwritten, with or without --force.
 *
 * Needs a free API key from https://www.pexels.com/api/ in PEXELS_API_KEY, plus the
 * usual DATABASE_URL. Re-running is safe: gigs that already have a photo are skipped
 * unless --force is passed.
 *
 *   npm run kapak:fotograf -- --dry-run     # show what it would do, change nothing
 *   npm run kapak:fotograf                  # fill in the gigs that have no photo
 *   npm run kapak:fotograf -- --force       # re-draw photos for every gig
 *   npm run kapak:fotograf -- --limit 20    # try it on a handful first
 */

const PEXELS_HOST = "https://images.pexels.com/";
const PER_PAGE = 80;
const MAX_PAGES_PER_QUERY = 4; // 320 photos is more than any one search term needs
const PHOTO_WIDTH = 900; // covers render at most ~800px wide

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const limitArg = args.indexOf("--limit");
const limit = limitArg === -1 ? Infinity : Number(args[limitArg + 1]);

const apiKey = process.env.PEXELS_API_KEY;
if (!apiKey && !dryRun) {
  console.error(
    "PEXELS_API_KEY yok. https://www.pexels.com/api/ adresinden ücretsiz alıp .env dosyasına ekle:\n" +
      "  PEXELS_API_KEY=...\n" +
      "(--dry-run ile anahtarsız da çalıştırıp hangi aramaların yapılacağını görebilirsin.)"
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Photo = { id: number; url: string; photographer: string };

/** Search results per term, fetched lazily and paged only when a term runs dry. */
const pools = new Map<string, { photos: Photo[]; nextPage: number; exhausted: boolean }>();

async function searchPage(query: string, page: number): Promise<Photo[]> {
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=${PER_PAGE}&page=${page}&orientation=landscape`;

  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { Authorization: apiKey as string } });

    if (response.status === 429) {
      // Free keys allow 200 requests an hour; back off rather than dropping the run.
      if (attempt > 4) throw new Error(`Pexels kota sınırı aşıldı (${query})`);
      const wait = 30_000 * attempt;
      console.warn(`  kota sınırı, ${wait / 1000}s bekleniyor…`);
      await new Promise((resolve) => setTimeout(resolve, wait));
      continue;
    }

    if (!response.ok) {
      throw new Error(`Pexels ${response.status} (${query}): ${await response.text()}`);
    }

    const body = (await response.json()) as {
      photos: { id: number; src: { large: string }; photographer: string }[];
    };

    return body.photos.map((photo) => ({
      id: photo.id,
      // Their CDN takes sizing in the query string, so ask for what the cards render.
      url: `${photo.src.large.split("?")[0]}?auto=compress&cs=tinysrgb&w=${PHOTO_WIDTH}`,
      photographer: photo.photographer,
    }));
  }
}

/** The next photo for this search term that no other listing has taken. */
async function takePhoto(query: string, used: Set<number>): Promise<Photo | null> {
  let pool = pools.get(query);
  if (!pool) {
    pool = { photos: [], nextPage: 1, exhausted: false };
    pools.set(query, pool);
  }

  for (;;) {
    const free = pool.photos.find((photo) => !used.has(photo.id));
    if (free) {
      used.add(free.id);
      return free;
    }
    if (pool.exhausted || pool.nextPage > MAX_PAGES_PER_QUERY) return null;

    const page = await searchPage(query, pool.nextPage);
    pool.nextPage += 1;
    if (page.length === 0) pool.exhausted = true;
    pool.photos.push(...page);
  }
}

async function main() {
  const gigs = await prisma.gig.findMany({
    select: { id: true, slug: true, title: true, coverImage: true, category: { select: { icon: true } } },
    orderBy: { slug: "asc" },
  });

  // A cover that is not ours and not empty belongs to the seller; leave it alone.
  const ours = (cover: string | null) => cover === null || cover.startsWith(PEXELS_HOST);
  const targets = gigs
    .filter((gig) => ours(gig.coverImage) && (force || gig.coverImage === null))
    .slice(0, limit);

  const skippedSellers = gigs.filter((gig) => !ours(gig.coverImage)).length;
  const alreadyDone = gigs.filter((gig) => gig.coverImage?.startsWith(PEXELS_HOST)).length;

  console.log(
    `${gigs.length} ilan · ${targets.length} işlenecek · ${alreadyDone} zaten fotoğraflı` +
      `${skippedSellers ? ` · ${skippedSellers} satıcı yüklemesi korunuyor` : ""}`
  );

  if (dryRun) {
    const byQuery = new Map<string, string[]>();
    for (const gig of targets) {
      const query = photoQueryFor(gig.category.icon, gig.slug);
      byQuery.set(query, [...(byQuery.get(query) ?? []), gig.title]);
    }
    console.log(`\n${byQuery.size} farklı arama yapılacak:\n`);
    for (const [query, titles] of [...byQuery].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`  ${String(titles.length).padStart(3)} × "${query}"  ör. ${titles[0]}`);
    }
    return;
  }

  // Photos already in use stay in use, so a resumed run does not hand out duplicates.
  const used = new Set<number>();
  for (const gig of gigs) {
    const id = gig.coverImage?.startsWith(PEXELS_HOST)
      ? Number(gig.coverImage.match(/\/photos\/(\d+)\//)?.[1])
      : NaN;
    if (Number.isFinite(id)) used.add(id);
  }

  let done = 0;
  let missing = 0;

  for (const gig of targets) {
    const query = photoQueryFor(gig.category.icon, gig.slug);
    const photo = await takePhoto(query, used);

    if (!photo) {
      // Nothing left for this term; the composed cover stays, which is a fine outcome.
      missing += 1;
      console.warn(`  ✗ ${gig.title} — "${query}" için boşta fotoğraf kalmadı`);
      continue;
    }

    await prisma.gig.update({ where: { id: gig.id }, data: { coverImage: photo.url } });
    done += 1;
    if (done % 25 === 0) console.log(`  ${done}/${targets.length}…`);
  }

  console.log(
    `\nBitti: ${done} ilana fotoğraf atandı${missing ? `, ${missing} ilan çizimli kapakla kaldı` : ""}.`
  );
  console.log("Fotoğraflar Pexels'ten geliyor (pexels.com/license) ve CDN'den servis ediliyor.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
