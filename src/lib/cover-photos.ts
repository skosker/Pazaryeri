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
const SEARCH_ATTEMPTS = 3;

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
  /** Terms the search failed on after retrying; the next round tries them again. */
  failed: string[];
  /** Set when the hourly quota stopped the run early. Everything assigned is saved. */
  rateLimited: string | null;
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

/** Their gateway hands out the odd 504; those are worth another go, a 401 is not. */
function isTransient(status: number) {
  return status === 429 || status >= 500;
}

export class RateLimitError extends Error {}

async function searchPage(query: string, page: number, apiKey: string): Promise<Photo[]> {
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=${PER_PAGE}&page=${page}&orientation=landscape`;

  let lastStatus = 0;

  for (let attempt = 0; attempt < SEARCH_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 600 * attempt));

    let response: Response;
    try {
      response = await fetch(url, { headers: { Authorization: apiKey }, cache: "no-store" });
    } catch {
      lastStatus = 0; // the connection itself failed; treat it like a transient upstream error
      continue;
    }

    if (response.ok) {
      const body = (await response.json()) as { photos: { id: number; src: { large: string } }[] };
      return body.photos.map((photo) => ({
        id: photo.id,
        // Their CDN takes sizing in the query string, so ask for what the cards render.
        url: `${photo.src.large.split("?")[0]}?auto=compress&cs=tinysrgb&w=${PHOTO_WIDTH}`,
      }));
    }

    lastStatus = response.status;

    // The hourly quota does not recover in a few hundred milliseconds, and a bad key
    // never will, so stop the whole run rather than retrying into the same wall.
    if (response.status === 429) {
      throw new RateLimitError(
        "Pexels saatlik istek sınırına takıldı. Atanan fotoğraflar kaydedildi; bir süre sonra kaldığın yerden devam edebilirsin."
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Pexels anahtarı kabul edilmedi (${response.status}).`);
    }
    if (!isTransient(response.status)) break;
  }

  throw new Error(`Pexels ${lastStatus || "bağlantı hatası"} — "${query}" araması başarısız.`);
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
  const failed: string[] = [];
  let assigned = 0;
  let queriesRun = 0;
  let rateLimited: RateLimitError | null = null;

  async function save(assignments: { id: string; url: string }[]) {
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
    assigned += assignments.length;
  }

  for (const [query, gigsForQuery] of [...groups].slice(0, maxQueries)) {
    const assignments: { id: string; url: string }[] = [];
    const pool: Photo[] = [];
    let page = 1;
    queriesRun += 1;

    try {
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
    } catch (error) {
      // One flaky search must not cost the terms that already succeeded, so each is
      // saved on its own and a failure only drops the term it happened on.
      if (error instanceof RateLimitError) rateLimited = error;
      else {
        failed.push(query);
        for (const assignment of assignments) used.delete(photoIdOf(assignment.url) ?? -1);
        assignments.length = 0;
      }
    }

    await save(assignments);
    if (rateLimited) break;
  }

  const after = summarise(await loadGigs(), force);
  return {
    ...after,
    assigned,
    queriesRun,
    exhausted,
    failed,
    rateLimited: rateLimited?.message ?? null,
  };
}
