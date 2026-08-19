import type { PrismaClient } from "../src/generated/prisma/client";
import { SYNTHETIC_PASSWORD_HASH, type SyntheticFreelancer } from "./synthetic-freelancers";

/**
 * Writes generated profiles into the database, shared by `prisma/seed.ts` and
 * `scripts/generate-freelancers.ts` so both fill a database exactly the same way.
 *
 * Rows are matched by e-mail. A row that exists but is not flagged `synthetic` belongs
 * to a real person who happens to hold that address, and is counted as skipped rather
 * than overwritten.
 */

export type SyncResult = { created: number; updated: number; skipped: string[] };

const CHUNK = 100;

function profileFields(person: SyntheticFreelancer) {
  return {
    name: person.name,
    title: person.title,
    city: person.city,
    age: person.age,
    skills: person.skills,
    image: person.image,
    bio: person.bio,
    isOnline: person.isOnline,
    isPro: person.isPro,
  };
}

export async function syncSyntheticFreelancers(
  prisma: PrismaClient,
  people: SyntheticFreelancer[],
  onProgress?: (done: number, total: number) => void
): Promise<SyncResult> {
  const existing = await prisma.user.findMany({
    where: { email: { in: people.map((person) => person.email) } },
    select: { email: true, synthetic: true },
  });
  const byEmail = new Map(existing.map((user) => [user.email, user]));

  const toCreate = people.filter((person) => !byEmail.has(person.email));
  const toUpdate = people.filter((person) => byEmail.get(person.email)?.synthetic === true);
  const skipped = people
    .filter((person) => byEmail.get(person.email)?.synthetic === false)
    .map((person) => person.email);

  let done = 0;
  const total = toCreate.length + toUpdate.length;

  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const batch = toCreate.slice(i, i + CHUNK);
    await prisma.user.createMany({
      data: batch.map((person) => ({
        ...profileFields(person),
        email: person.email,
        role: "FREELANCER" as const,
        passwordHash: SYNTHETIC_PASSWORD_HASH,
        emailVerified: new Date(),
        synthetic: true,
      })),
      skipDuplicates: true,
    });
    done += batch.length;
    onProgress?.(done, total);
  }

  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const batch = toUpdate.slice(i, i + CHUNK);
    await prisma.$transaction(
      batch.map((person) =>
        // The `synthetic` filter is repeated here on purpose: between the read above and
        // this write, the row must still be one of ours.
        prisma.user.updateMany({
          where: { email: person.email, synthetic: true },
          data: profileFields(person),
        })
      )
    );
    done += batch.length;
    onProgress?.(done, total);
  }

  return { created: toCreate.length, updated: toUpdate.length, skipped };
}
