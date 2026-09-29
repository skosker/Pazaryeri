import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { sendFounderWelcomeEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Places left and the total (set at /admin/ayarlar). Zero while the campaign is switched
 * off there, which also hides every "Kurucu Freelancer ol" call-out; badges already
 * given stay.
 */
export async function founderPlaces(): Promise<{ remaining: number; limit: number }> {
  const { founderEnabled, founderLimit } = await getSettings();
  if (!founderEnabled) return { remaining: 0, limit: founderLimit };
  const taken = await prisma.user.count({ where: { founderNumber: { not: null } } });
  return { remaining: Math.max(0, founderLimit - taken), limit: founderLimit };
}

/**
 * Give the seller the next Kurucu Freelancer place if they are a real freelancer with a
 * live gig and places are left. Called whenever one of their gigs goes live; a no-op
 * for everyone else, so calling it more than once is harmless.
 */
export async function grantFounderIfEligible(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      synthetic: true,
      suspended: true,
      passwordHash: true,
      founderNumber: true,
      founderAt: true,
      name: true,
      email: true,
      gigs: { where: { published: true }, select: { id: true }, take: 1 },
    },
  });
  // founderAt without a number: an admin took the badge back, so it is not handed out again.
  if (!user || user.founderNumber !== null || user.founderAt !== null) return;
  // Showcase profiles carry a "!…" no-login marker instead of a bcrypt hash.
  if (user.role !== "FREELANCER" || user.synthetic || user.suspended || user.passwordHash.startsWith("!")) return;
  if (user.gigs.length === 0) return;

  const { founderEnabled, founderLimit } = await getSettings();
  if (!founderEnabled) return;

  // Two approvals at the same moment can both read the same max; the unique index turns
  // the loser's write into P2002, and it simply tries the next number.
  for (let attempt = 0; attempt < 3; attempt++) {
    // Places are counted, not numbered: a badge taken back frees its place, while its
    // number is not reused.
    const [taken, last] = await Promise.all([
      prisma.user.count({ where: { founderNumber: { not: null } } }),
      prisma.user.aggregate({ _max: { founderNumber: true } }),
    ]);
    if (taken >= founderLimit) return;
    const next = (last._max.founderNumber ?? 0) + 1;
    try {
      const { count } = await prisma.user.updateMany({
        where: { id: userId, founderNumber: null },
        data: { founderNumber: next, founderAt: new Date() },
      });
      if (count === 0) return;
      await sendFounderWelcomeEmail({
        to: user.email,
        name: user.name,
        profileUrl: `${appUrl}/freelancer/${userId}`,
      });
      return;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
}

/**
 * Admin takes the badge back (e.g. a fake account slipped through). founderAt is kept, which
 * marks the account so grantFounderIfEligible does not give it a new place on its next gig.
 */
export async function revokeFounder(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId, founderNumber: { not: null } },
    data: { founderNumber: null },
  });
}

/** Undo a revoke: the account gets the next number, whatever the limit (an admin's call). */
export async function restoreFounder(userId: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const last = await prisma.user.aggregate({ _max: { founderNumber: true } });
    try {
      await prisma.user.updateMany({
        where: { id: userId, founderNumber: null, founderAt: { not: null } },
        data: { founderNumber: (last._max.founderNumber ?? 0) + 1 },
      });
      return;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
}
