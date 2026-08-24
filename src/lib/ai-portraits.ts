import { prisma } from "@/lib/prisma";
import { PEXELS_HOST, RateLimitError } from "@/lib/cover-photos";
import { looksFeminine } from "@/lib/turkish-names";
import { putImageBuffer, deleteImageIfLocal } from "@/lib/storage";
import { drawnAvatarUrl } from "@/lib/avatar-seed";

/**
 * AI-generated Turkish portraits for the synthetic freelancer profiles, via Replicate's
 * Flux model.
 *
 * This is the alternative to the Pexels fetch (profile-photos.ts). A stock library cannot
 * be made to return reliably Turkish faces — it has no ethnicity filter and its "turkish"
 * searches still come back with the global model pool — so foreign-looking faces kept
 * slipping through. A generation model has no such limit: the prompt asks for a Turkish
 * face and that is what it draws, of a person who does not exist, so there is no consent,
 * licence or model-release problem the way a real stranger's photo would carry.
 *
 * Only profiles flagged `synthetic` are ever touched, and only those still on a drawn
 * avatar or an earlier Pexels photo — a real seller's own upload is never replaced. Unlike
 * Pexels, the image is not a URL we can point at: Replicate's output link expires within
 * the hour, so the bytes are downloaded and stored (Vercel Blob when configured, Postgres
 * otherwise, via putImageBuffer) and `User.image` holds our own served URL.
 *
 * Work is done a few profiles at a time: the caller passes `nextIndex` back in to
 * continue, which keeps each request short enough for a serverless function, since one
 * generation takes a few seconds.
 */

const MODEL = "black-forest-labs/flux-schnell";
const UPDATE_CHUNK = 10;

type Bucket = "kadin" | "erkek";

/** What a synthetic profile's current image is: ours to replace, or a real upload. */
function isReplaceable(image: string | null) {
  return image === null || image.startsWith("/api/avatar/") || image.startsWith(PEXELS_HOST);
}

/** An image this module already wrote — a stored portrait, not an avatar or Pexels URL. */
function isAiPortrait(image: string | null) {
  return !!image && !image.startsWith("/api/avatar/") && !image.startsWith(PEXELS_HOST);
}

export type AiPortraitProgress = {
  total: number;
  withPortrait: number;
  pending: number;
};

export type AiPortraitBatch = AiPortraitProgress & {
  assigned: number;
  /** Where the next call should carry on; past the end means the sweep is finished. */
  nextIndex: number;
  /** Profiles whose generation failed this run; worth another sweep. */
  failed: number;
  /** Set when the account's spending/rate limit stopped the run early. */
  rateLimited: string | null;
};

type ProfileRow = { id: string; name: string; email: string; image: string | null };

export function hasReplicateKey() {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

async function loadProfiles(): Promise<ProfileRow[]> {
  return prisma.user.findMany({
    where: { role: "FREELANCER", synthetic: true },
    select: { id: true, name: true, email: true, image: true },
    orderBy: { id: "asc" },
  });
}

/** Which face to draw. The name answers it; anything ambiguous is split evenly and stably. */
function bucketFor(row: ProfileRow): Bucket {
  if (row.image?.startsWith("/api/avatar/k-")) return "kadin";
  if (row.image?.startsWith("/api/avatar/e-")) return "erkek";

  const feminine = looksFeminine(row.name.split(" ")[0]);
  if (feminine !== null) return feminine ? "kadin" : "erkek";
  return row.name.length % 2 === 0 ? "kadin" : "erkek";
}

function summarise(profiles: ProfileRow[], force: boolean): AiPortraitProgress {
  const withPortrait = profiles.filter((row) => isAiPortrait(row.image)).length;
  const pending = profiles.filter(
    (row) => isReplaceable(row.image) || (force && isAiPortrait(row.image))
  ).length;
  return { total: profiles.length, withPortrait, pending };
}

export async function aiPortraitProgress(): Promise<AiPortraitProgress> {
  return summarise(await loadProfiles(), false);
}

// A little variety so a thousand portraits are not the same studio shot: an age band, an
// attire and a setting, spun from the profile so the same row always regenerates the same
// look. None of these change who the face is — that is fixed as Turkish in the base prompt.
const AGES = ["in their late 20s", "in their early 30s", "in their late 30s", "in their 40s"];
const ATTIRE_KADIN = ["a blazer", "a knit sweater", "a blouse", "a smart casual shirt"];
const ATTIRE_ERKEK = ["a blazer", "a knit sweater", "a button-up shirt", "a smart casual shirt"];
const SETTINGS = [
  "plain neutral studio background",
  "softly blurred office background",
  "light grey background",
  "softly blurred bright interior",
];

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

function buildPrompt(row: ProfileRow, bucket: Bucket): string {
  const seed = row.email.length + row.name.length;
  const person = bucket === "kadin" ? "Turkish woman" : "Turkish man";
  const attire = bucket === "kadin" ? pick(ATTIRE_KADIN, seed) : pick(ATTIRE_ERKEK, seed >> 1);
  return (
    `professional headshot portrait photograph of a ${person} ${pick(AGES, seed)}, ` +
    `wearing ${attire}, ${pick(SETTINGS, seed >> 2)}, natural soft lighting, ` +
    `looking at the camera, friendly confident expression, sharp focus, realistic, ` +
    `head and shoulders, centered`
  );
}

/** A generation model returning an image URL, or throwing on quota/auth errors. */
async function generatePortrait(prompt: string, seed: number): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN tanımlı değil.");

  const response = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Block until the prediction finishes rather than returning a job to poll — Flux
      // schnell is fast, and one synchronous call keeps the batch loop simple.
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: "1:1",
        num_outputs: 1,
        output_format: "webp",
        output_quality: 80,
        seed,
        go_fast: true,
        megapixels: "1",
      },
    }),
    cache: "no-store",
  });

  if (response.status === 429) {
    throw new RateLimitError(
      "Replicate istek/harcama sınırına takıldı. Üretilen portreler kaydedildi; bir süre sonra kaldığın yerden devam edebilirsin."
    );
  }
  if (response.status === 401 || response.status === 402 || response.status === 403) {
    throw new Error(`Replicate anahtarı kabul edilmedi ya da bakiye yetersiz (${response.status}).`);
  }
  if (!response.ok) {
    throw new Error(`Replicate ${response.status} — üretim başarısız.`);
  }

  const body = (await response.json()) as { output?: string | string[]; error?: string };
  if (body.error) throw new Error(`Replicate: ${body.error}`);

  const url = Array.isArray(body.output) ? body.output[0] : body.output;
  if (!url) throw new Error("Replicate boş sonuç döndü.");

  const image = await fetch(url, { cache: "no-store" });
  if (!image.ok) throw new Error(`Üretilen görsel indirilemedi (${image.status}).`);
  return Buffer.from(await image.arrayBuffer());
}

/**
 * Generates portraits for up to `batchSize` profiles, then returns. Callers keep going
 * while `nextIndex` is inside the list. Each profile is saved on its own, so a failure
 * only costs the one it happened on.
 */
export async function assignAiPortraits({
  force = false,
  startIndex = 0,
  batchSize = 3,
}: { force?: boolean; startIndex?: number; batchSize?: number } = {}): Promise<AiPortraitBatch> {
  if (!hasReplicateKey()) throw new Error("REPLICATE_API_TOKEN tanımlı değil.");

  const profiles = await loadProfiles();
  const targets = profiles.filter(
    (row) => isReplaceable(row.image) || (force && isAiPortrait(row.image))
  );

  let assigned = 0;
  let failed = 0;
  let index = startIndex;
  let rateLimited: RateLimitError | null = null;

  for (; index < targets.length && assigned + failed < batchSize; index++) {
    const row = targets[index];
    const bucket = bucketFor(row);
    const seed = (row.email.length * 131 + row.name.length * 17) % 1_000_000;

    try {
      const buffer = await generatePortrait(buildPrompt(row, bucket), seed);
      const url = await putImageBuffer(buffer, "image/webp", "webp");

      // Replacing an earlier AI portrait (a forced re-run): drop the old bytes so a
      // regenerate does not leave orphaned rows behind.
      if (isAiPortrait(row.image)) await deleteImageIfLocal(row.image);

      await prisma.user.update({ where: { id: row.id }, data: { image: url } });
      assigned += 1;
    } catch (error) {
      if (error instanceof RateLimitError) {
        rateLimited = error;
        break;
      }
      failed += 1;
    }
  }

  const after = summarise(await loadProfiles(), force);
  return {
    ...after,
    assigned,
    failed,
    nextIndex: index,
    rateLimited: rateLimited?.message ?? null,
  };
}

/**
 * Puts the generated profiles back on their drawn avatars and drops the stored portrait
 * bytes. The way back, mirroring resetProfilePhotos — a re-run can fetch them again.
 */
export async function resetAiPortraits(): Promise<{ reset: number }> {
  const profiles = await prisma.user.findMany({
    where: { role: "FREELANCER", synthetic: true },
    select: { id: true, name: true, email: true, image: true },
  });

  const targets = profiles.filter((row) => isAiPortrait(row.image));

  for (let i = 0; i < targets.length; i += UPDATE_CHUNK) {
    const slice = targets.slice(i, i + UPDATE_CHUNK);
    await prisma.$transaction(
      slice.map((row) =>
        prisma.user.update({
          where: { id: row.id },
          data: { image: drawnAvatarUrl(row.name, row.email) },
        })
      )
    );
    // Free the stored bytes after the rows stop pointing at them.
    await Promise.all(slice.map((row) => deleteImageIfLocal(row.image)));
  }

  return { reset: targets.length };
}
