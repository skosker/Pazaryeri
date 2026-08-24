import { prisma } from "@/lib/prisma";
import { PEXELS_HOST, RateLimitError } from "@/lib/cover-photos";
import { looksFeminine } from "@/lib/turkish-names";
import { drawnAvatarUrl } from "@/lib/avatar-seed";

/**
 * Real portrait photographs for the generated freelancer profiles, from Pexels.
 *
 * Only profiles flagged `synthetic` are touched — a real person never gets a stranger's
 * face — and only when what they have is a drawn avatar or an earlier photo from here.
 * What is stored in `User.image` is the Pexels CDN URL, not the bytes: their licence
 * allows serving the images directly, and 1200 downloaded portraits would be a lot of
 * database for no gain.
 *
 * Searches are split by the gender the profile's name reads as, so a freelancer called
 * Elif does not end up with a photo of a man, and every profile gets a photo no other
 * profile is using. Work is done a few searches at a time: the caller passes `nextQuery`
 * back in to continue, which keeps each request short enough for a serverless function.
 *
 * Profiles left without a photo — because a search ran out of unused results — keep the
 * drawn avatar, which is what /api/avatar/[seed] is for.
 */

const PER_PAGE = 80;
// Two pages, not five. Relevance decays fast: the first page or two of "genç türk iş
// kadını portre" is what the search actually means, and by page five it is generic stock
// that matches almost nothing about the term. Depth comes from more searches instead.
const MAX_PAGES_PER_QUERY = 2;
const PHOTO_WIDTH = 400; // avatars render at most ~96px, twice that covers retina
const UPDATE_CHUNK = 25;
const SEARCH_ATTEMPTS = 3;

type Bucket = "kadin" | "erkek";

/**
 * Searches are interleaved by gender so a run that stops halfway has filled in both, and
 * worded to bring back head-and-shoulders shots: a full-body photo loses its face when a
 * round avatar crops it.
 *
 * They ask for working-age people, framed as portraits: the profiles' ages run from 22 to
 * 58 and cluster in the thirties, so a portrait of someone in their seventies contradicts
 * the age printed next to it.
 *
 * Every search names Turkey or a Turkish city, and that is the whole point of the list.
 * `locale` sets the language the query is read in, not the country of the people in the
 * results: a generic search like "genç kadın portre" under tr-TR still comes back from the
 * same global stock pool, which is overwhelmingly not Turkish. Generic wording was where
 * the foreign-looking faces were coming from, so none of it survives here — a search that
 * does not say "türk", "istanbul", "ankara", "izmir" or "turkey" does not belong in this
 * list. Depth comes from the number of searches rather than from paging deeper into any
 * one of them, because page five of a search no longer resembles what was asked for.
 *
 * The cost is coverage. Pexels does not hold twelve hundred Turkish portraits — nowhere
 * near — so the pool runs out long before the profiles do, and every profile past that
 * point keeps its drawn avatar. That is the intended trade: an illustrated avatar belongs
 * to nobody, whereas a Dutch stock portrait next to the name Elif Yılmaz is simply wrong.
 */
const searches: { query: string; bucket: Bucket; locale: string }[] = [
  { query: "türk kadın portre", bucket: "kadin", locale: "tr-TR" },
  { query: "türk erkek portre", bucket: "erkek", locale: "tr-TR" },
  { query: "genç türk iş kadını portre", bucket: "kadin", locale: "tr-TR" },
  { query: "genç türk iş adamı portre", bucket: "erkek", locale: "tr-TR" },
  { query: "türk kadın yakın çekim portre", bucket: "kadin", locale: "tr-TR" },
  { query: "türk erkek yakın çekim portre", bucket: "erkek", locale: "tr-TR" },
  { query: "istanbul kadın portre", bucket: "kadin", locale: "tr-TR" },
  { query: "istanbul erkek portre", bucket: "erkek", locale: "tr-TR" },
  { query: "gülümseyen türk kadın portre", bucket: "kadin", locale: "tr-TR" },
  { query: "gülümseyen türk erkek portre", bucket: "erkek", locale: "tr-TR" },
  { query: "türk kadın ofis portre", bucket: "kadin", locale: "tr-TR" },
  { query: "türk erkek ofis portre", bucket: "erkek", locale: "tr-TR" },
  { query: "young turkish woman portrait", bucket: "kadin", locale: "en-US" },
  { query: "young turkish man portrait", bucket: "erkek", locale: "en-US" },
  { query: "turkish businesswoman headshot", bucket: "kadin", locale: "en-US" },
  { query: "turkish businessman headshot", bucket: "erkek", locale: "en-US" },
  { query: "turkish woman headshot", bucket: "kadin", locale: "en-US" },
  { query: "turkish man headshot", bucket: "erkek", locale: "en-US" },
  { query: "istanbul woman portrait", bucket: "kadin", locale: "en-US" },
  { query: "istanbul man portrait", bucket: "erkek", locale: "en-US" },
  { query: "istanbul businesswoman", bucket: "kadin", locale: "en-US" },
  { query: "istanbul businessman", bucket: "erkek", locale: "en-US" },
  { query: "ankara woman portrait", bucket: "kadin", locale: "en-US" },
  { query: "ankara man portrait", bucket: "erkek", locale: "en-US" },
  { query: "izmir woman portrait", bucket: "kadin", locale: "en-US" },
  { query: "izmir man portrait", bucket: "erkek", locale: "en-US" },
  { query: "turkey woman portrait", bucket: "kadin", locale: "en-US" },
  { query: "turkey man portrait", bucket: "erkek", locale: "en-US" },
];

export type ProfilePhotoProgress = {
  total: number;
  withPhoto: number;
  pending: number;
};

export type ProfilePhotoBatch = ProfilePhotoProgress & {
  assigned: number;
  /** Where the next call should carry on; past the end means the sweep is finished. */
  nextQuery: number;
  queriesRun: number;
  /** Searches that had no unused results left; those profiles keep the drawn avatar. */
  exhausted: string[];
  /** Searches that failed after retrying. Worth another sweep — they may come back. */
  failed: string[];
  /** Set when the hourly quota stopped the run early. Everything assigned is saved. */
  rateLimited: string | null;
};

type ProfileRow = { id: string; name: string; image: string | null };

/** A photo this module wrote, a drawn avatar, or nothing at all. */
function isOurs(image: string | null) {
  return image === null || image.startsWith("/api/avatar/") || image.startsWith(PEXELS_HOST);
}

function photoIdOf(image: string | null) {
  if (!image?.startsWith(PEXELS_HOST)) return null;
  const id = image.match(/\/photos\/(\d+)\//)?.[1];
  return id ? Number(id) : null;
}

/**
 * Which set of searches a profile draws from. The drawn avatar already encoded this, and
 * the name answers it for rows whose avatar has since been replaced by a photo.
 */
function bucketFor(row: ProfileRow): Bucket {
  if (row.image?.startsWith("/api/avatar/k-")) return "kadin";
  if (row.image?.startsWith("/api/avatar/e-")) return "erkek";

  const feminine = looksFeminine(row.name.split(" ")[0]);
  if (feminine !== null) return feminine ? "kadin" : "erkek";

  // A name in neither list still needs one of the two; split them evenly and stably.
  return row.name.length % 2 === 0 ? "kadin" : "erkek";
}

async function loadProfiles(): Promise<ProfileRow[]> {
  return prisma.user.findMany({
    where: { role: "FREELANCER", synthetic: true },
    select: { id: true, name: true, image: true },
    orderBy: { id: "asc" },
  });
}

function summarise(profiles: ProfileRow[], force: boolean): ProfilePhotoProgress {
  const withPhoto = profiles.filter((row) => row.image?.startsWith(PEXELS_HOST)).length;
  const pending = profiles.filter(
    (row) => isOurs(row.image) && (force || !row.image?.startsWith(PEXELS_HOST))
  ).length;
  return { total: profiles.length, withPhoto, pending };
}

export async function profilePhotoProgress(): Promise<ProfilePhotoProgress> {
  return summarise(await loadProfiles(), false);
}

/**
 * Puts every generated profile back on its drawn avatar, dropping the fetched
 * photographs. This is the way back: the photo run can be repeated afterwards, and
 * nothing here is lost that a re-run cannot fetch again.
 *
 * Only profiles this module owns are touched — a real seller's own upload is not a photo
 * we fetched, and is left alone.
 */
export async function resetProfilePhotos(): Promise<{ reset: number }> {
  const profiles = await prisma.user.findMany({
    where: { role: "FREELANCER", synthetic: true },
    select: { id: true, name: true, email: true, image: true },
  });

  const targets = profiles.filter((row) => row.image?.startsWith(PEXELS_HOST) || row.image === null);

  for (let i = 0; i < targets.length; i += UPDATE_CHUNK) {
    await prisma.$transaction(
      targets.slice(i, i + UPDATE_CHUNK).map((row) =>
        prisma.user.update({
          where: { id: row.id },
          data: { image: drawnAvatarUrl(row.name, row.email) },
        })
      )
    );
  }

  return { reset: targets.length };
}

type Photo = { id: number; url: string; alt: string };

/**
 * Pexels describes every photo in English in its `alt` field ("Woman in White Long Sleeve
 * Shirt", "Elderly Man Sitting on Bench"). The search itself cannot filter by who is in
 * the picture, but this description can: it is the only thing that tells us a result for
 * "genç kadın portre" is actually a man, a crowd, or somebody in their eighties.
 *
 * A photo has to say who it shows and match the profile's name. Anything that does not —
 * an empty description, a group, an age that contradicts the profile — is left for another
 * profile or skipped entirely; the drawn avatar is a better answer than a wrong photo.
 */
function fitsProfile(alt: string, bucket: Bucket) {
  const text = alt.toLowerCase();
  if (text.length === 0) return false;

  // Not one person, or not a person at all.
  if (/\b(group|crowd|team|couple|family|friends|children|kids|people)\b/.test(text)) return false;
  if (/\b(child|baby|toddler|boy|girl)\b/.test(text)) return false;

  // The profiles are 22 to 58; these describe someone well outside that.
  if (/\b(elderly|senior|old|aged|grandmother|grandfather|granny)\b/.test(text)) return false;

  // Searching a stock library for a nationality also brings back documentary and tourism
  // work — folk dress, village scenes, a vendor at a bazaar. Those are photographs of
  // Turkey rather than portraits of the working professional the profile claims to be.
  if (/\b(traditional|folk|folkloric|costume|village|peasant|nomad|dervish|ottoman)\b/.test(text))
    return false;
  if (/\b(vendor|merchant|seller|bazaar|market|shopkeeper|tourist|refugee)\b/.test(text))
    return false;

  // "woman" and "women" keep their own word boundaries, so \bman\b cannot match inside them.
  const feminine = /\b(woman|women|female|lady|businesswoman)\b/.test(text);
  const masculine = /\b(man|men|male|guy|gentleman|businessman)\b/.test(text);

  return bucket === "kadin" ? feminine && !masculine : masculine && !feminine;
}

/** Their gateway hands out the odd 504; those are worth another go, a 401 is not. */
function isTransient(status: number) {
  return status === 429 || status >= 500;
}

async function searchPage(
  query: string,
  page: number,
  apiKey: string,
  locale: string
): Promise<Photo[]> {
  // The locale is what makes a Turkish query search Turkish content rather than being
  // read as an unfamiliar string.
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=${PER_PAGE}&page=${page}&orientation=portrait&locale=${locale}`;

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
      const body = (await response.json()) as {
        photos: { id: number; alt?: string; src: { large: string } }[];
      };
      return body.photos.map((photo) => ({
        id: photo.id,
        alt: photo.alt ?? "",
        // The whole portrait, not a square cut from its middle: the CDN crops from the
        // centre and has no idea where the face is, so a full-length shot would come
        // back as a torso. UserAvatar crops towards the top instead, where heads are.
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
 * Assigns photos for as many profiles as `maxQueries` searches cover, then returns.
 * Callers keep going while `nextQuery` is inside the list.
 */
export async function assignProfilePhotos({
  force = false,
  startQuery = 0,
  maxQueries = 4,
}: { force?: boolean; startQuery?: number; maxQueries?: number } = {}): Promise<ProfilePhotoBatch> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY tanımlı değil.");

  const profiles = await loadProfiles();
  const targets = profiles.filter(
    (row) => isOurs(row.image) && (force || !row.image?.startsWith(PEXELS_HOST))
  );

  // Photos already on other profiles stay taken, so resuming never hands out a duplicate.
  const targetIds = new Set(targets.map((row) => row.id));
  const used = new Set<number>();
  for (const row of profiles) {
    if (targetIds.has(row.id)) continue; // about to be replaced, so its photo is free again
    const id = photoIdOf(row.image);
    if (id !== null) used.add(id);
  }

  const queue: Record<Bucket, ProfileRow[]> = { kadin: [], erkek: [] };
  for (const row of targets) queue[bucketFor(row)].push(row);

  const exhausted: string[] = [];
  const failed: string[] = [];
  let assigned = 0;
  let queriesRun = 0;
  let index = startQuery;
  let rateLimited: RateLimitError | null = null;

  async function save(assignments: { id: string; url: string }[]) {
    for (let i = 0; i < assignments.length; i += UPDATE_CHUNK) {
      await prisma.$transaction(
        assignments.slice(i, i + UPDATE_CHUNK).map((assignment) =>
          prisma.user.update({
            where: { id: assignment.id },
            data: { image: assignment.url },
          })
        )
      );
    }
    assigned += assignments.length;
  }

  for (; index < searches.length && queriesRun < maxQueries; index++) {
    const { query, bucket, locale } = searches[index];
    if (queue[bucket].length === 0) continue; // nobody left needing this kind of photo

    queriesRun += 1;
    const assignments: { id: string; url: string }[] = [];
    const pool: Photo[] = [];
    let page = 1;

    try {
      const usable = (candidate: Photo) =>
        !used.has(candidate.id) && fitsProfile(candidate.alt, bucket);

      while (queue[bucket].length > 0) {
        let photo = pool.find(usable);

        while (!photo && page <= MAX_PAGES_PER_QUERY) {
          const fetched = await searchPage(query, page, apiKey, locale);
          page += 1;
          if (fetched.length === 0) break;
          pool.push(...fetched);
          photo = pool.find(usable);
        }

        if (!photo) {
          // Nothing unused left for this search; the rest wait for the next one.
          exhausted.push(query);
          break;
        }

        used.add(photo.id);
        assignments.push({ id: queue[bucket].shift()!.id, url: photo.url });
      }
    } catch (error) {
      // One flaky search must not cost the searches that already succeeded, so each is
      // saved on its own and a failure only drops the one it happened on. The profiles
      // it was going to cover go back in the queue for the next sweep.
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

  const after = summarise(await loadProfiles(), force);
  return {
    ...after,
    assigned,
    nextQuery: index,
    queriesRun,
    exhausted,
    failed,
    rateLimited: rateLimited?.message ?? null,
  };
}
