import { prisma } from "@/lib/prisma";
import { photoQueryFor } from "@/lib/cover-photo-queries";

/**
 * Fills in gig covers with real photographs from Pexels.
 *
 * The search term for a listing comes from the words in its own slug (see
 * cover-photo-queries.ts), and every listing gets a photo no other listing is using.
 * What is stored in `Gig.coverImage` is the Pexels CDN URL rather than the bytes: their
 * licence allows serving the images directly, and 980 downloaded photos would be ~150MB
 * sitting in the database for no gain.
 *
 * Work is batched by search term, not by listing. One search returns 80 photos, which is
 * enough for the largest group of listings, so the whole catalogue costs about as many
 * API calls as there are distinct terms — comfortably inside the 200/hour a free key
 * allows, however many times the run is resumed.
 *
 * Covers this module did not write are never touched. A URL that is not on the Pexels
 * host belongs to the seller, and `force` does not override that.
 */

export const PEXELS_HOST = "https://images.pexels.com/";

const PER_PAGE = 80;
const MAX_PAGES_PER_QUERY = 4;
const PHOTO_WIDTH = 900; // covers render at most ~800px wide
const UPDATE_CHUNK = 25;

export type CoverPhotoProgress = {
  total: number;
  withPhoto: number;
  sellerUploads: number;
  pending: number;
};

export type CoverPhotoBatch = CoverPhotoProgress & {
  assigned: number;
  queriesRun: number;
  /** Terms that ran out of unused photos; those listings keep the drawn cover. */
  exhausted: string[];
};

type GigRow = {
  id: string;
  slug: string;
  coverImage: string | null;
  category: { icon: string };
};

function isOurs(cover: string | null) {
  return cover === null || cover.startsWith(PEXELS_HOST);
}

function photoIdOf(cover: string | null) {
  if (!cover?.startsWith(PEXELS_HOST)) return null;
  const id = cover.match(/\/photos\/(\d+)\//)?.[1];
  return id ? Number(id) : null;
}

async function loadGigs(): Promise<GigRow[]> {
  return prisma.gig.findMany({
    select: { id: true, slug: true, coverImage: true, category: { select: { icon: true } } },
    orderBy: { slug: "asc" },
  });
}

function summarise(gigs: GigRow[], force: boolean): CoverPhotoProgress {
  const sellerUploads = gigs.filter((gig) => !isOurs(gig.coverImage)).length;
  const withPhoto = gigs.filter((gig) => gig.coverImage?.startsWith(PEXELS_HOST)).length;
  const pending = gigs.filter(
    (gig) => isOurs(gig.coverImage) && (force || gig.coverImage === null)
  ).length;
  return { total: gigs.length, withPhoto, sellerUploads, pending };
}

export async function coverPhotoProgress(): Promise<CoverPhotoProgress> {
  return summarise(await loadGigs(), false);
}

export function hasPexelsKey() {
  return Boolean(process.env.PEXELS_API_KEY);
}

type Photo = { id: number; url: string };

async function searchPage(query: string, page: number, apiKey: string): Promise<Photo[]> {
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=${PER_PAGE}&page=${page}&orientation=landscape`;

  const response = await fetch(url, { headers: { Authorization: apiKey }, cache: "no-store" });

  if (response.status === 429) {
    throw new Error(
      "Pexels saatlik istek sınırına takıldı. Bir süre sonra kaldığı yerden devam edebilirsin."
    );
  }
  if (!response.ok) {
    throw new Error(`Pexels ${response.status} — "${query}" araması başarısız.`);
  }

  const body = (await response.json()) as { photos: { id: number; src: { large: string } }[] };

  return body.photos.map((photo) => ({
    id: photo.id,
    // Their CDN takes sizing in the query string, so ask for what the cards render.
    url: `${photo.src.large.split("?")[0]}?auto=compress&cs=tinysrgb&w=${PHOTO_WIDTH}`,
  }));
}

/**
 * Assigns photos to as many listings as `maxQueries` search terms cover, then returns.
 * Callers keep going while `pending` is above zero, so a long catalogue is walked in
 * short pieces that each fit inside a serverless request.
 */
export async function assignCoverPhotos({
  force = false,
  maxQueries = 12,
}: { force?: boolean; maxQueries?: number } = {}): Promise<CoverPhotoBatch> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY tanımlı değil.");

  const gigs = await loadGigs();
  const targets = gigs.filter(
    (gig) => isOurs(gig.coverImage) && (force || gig.coverImage === null)
  );

  // Photos already on other listings stay taken, so resuming never hands out a duplicate.
  const targetIds = new Set(targets.map((gig) => gig.id));
  const used = new Set<number>();
  for (const gig of gigs) {
    if (targetIds.has(gig.id)) continue; // about to be replaced, so its photo is free again
    const id = photoIdOf(gig.coverImage);
    if (id !== null) used.add(id);
  }

  const groups = new Map<string, GigRow[]>();
  for (const gig of targets) {
    const query = photoQueryFor(gig.category.icon, gig.slug);
    groups.set(query, [...(groups.get(query) ?? []), gig]);
  }

  const exhausted: string[] = [];
  const assignments: { id: string; url: string }[] = [];
  let queriesRun = 0;

  for (const [query, gigsForQuery] of [...groups].slice(0, maxQueries)) {
    const pool: Photo[] = [];
    let page = 1;
    queriesRun += 1;

    for (const gig of gigsForQuery) {
      let photo = pool.find((candidate) => !used.has(candidate.id));

      while (!photo && page <= MAX_PAGES_PER_QUERY) {
        const fetched = await searchPage(query, page, apiKey);
        page += 1;
        if (fetched.length === 0) break;
        pool.push(...fetched);
        photo = pool.find((candidate) => !used.has(candidate.id));
      }

      if (!photo) {
        // Nothing unused left for this term; the drawn cover stays, which is fine.
        if (!exhausted.includes(query)) exhausted.push(query);
        break;
      }

      used.add(photo.id);
      assignments.push({ id: gig.id, url: photo.url });
    }
  }

  for (let i = 0; i < assignments.length; i += UPDATE_CHUNK) {
    await prisma.$transaction(
      assignments.slice(i, i + UPDATE_CHUNK).map((assignment) =>
        prisma.gig.update({
          where: { id: assignment.id },
          data: { coverImage: assignment.url },
        })
      )
    );
  }

  const after = summarise(await loadGigs(), force);
  return { ...after, assigned: assignments.length, queriesRun, exhausted };
}
