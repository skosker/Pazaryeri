import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { sendFounderWelcomeEmail } from "@/lib/email";

/** How many Kurucu Freelancer places there are in total. */
export const FOUNDER_LIMIT = 100;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function foundersRemaining(): Promise<number> {
  const taken = await prisma.user.count({ where: { founderNumber: { not: null } } });
  return Math.max(0, FOUNDER_LIMIT - taken);
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
      name: true,
      email: true,
      gigs: { where: { published: true }, select: { id: true }, take: 1 },
    },
  });
  if (!user || user.founderNumber !== null) return;
  // Showcase profiles carry a "!…" no-login marker instead of a bcrypt hash.
  if (user.role !== "FREELANCER" || user.synthetic || user.suspended || user.passwordHash.startsWith("!")) return;
  if (user.gigs.length === 0) return;

  // Two approvals at the same moment can both read the same max; the unique index turns
  // the loser's write into P2002, and it simply tries the next number.
  for (let attempt = 0; attempt < 3; attempt++) {
    const last = await prisma.user.aggregate({ _max: { founderNumber: true } });
    const next = (last._max.founderNumber ?? 0) + 1;
    if (next > FOUNDER_LIMIT) return;
    try {
      const { count } = await prisma.user.updateMany({
        where: { id: userId, founderNumber: null },
        data: { founderNumber: next, founderAt: new Date() },
      });
      if (count === 0) return;
      await sendFounderWelcomeEmail({
        to: user.email,
        name: user.name,
        founderNumber: next,
        profileUrl: `${appUrl}/freelancer/${userId}`,
      });
      return;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
}
