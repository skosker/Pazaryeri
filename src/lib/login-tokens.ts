import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { isBulkTestEmail } from "@/lib/test-accounts";
import type { Role } from "@/generated/prisma/client";

/**
 * One-time sign-in links for bulk-opened test accounts, so an admin (or the testing firm)
 * can walk the site as each of them without handing out passwords. Only the SHA-256 of a
 * token is stored; a link works once, within LINK_TTL_MS, and only for an account that is
 * still a verified, unsuspended test account on the test domain.
 */

const LINK_TTL_MS = 10 * 60 * 1000;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

type TestAccount = { id: string; name: string; email: string; role: Role; image: string | null };

async function usableAccount(userId: string): Promise<TestAccount | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, image: true, isTester: true, suspended: true, emailVerified: true },
  });
  if (!user || !user.isTester || user.suspended || !user.emailVerified || !isBulkTestEmail(user.email)) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image };
}

/** A fresh link token for a test account, or null when the account does not qualify. */
export async function createLoginToken(userId: string, adminId: string): Promise<string | null> {
  if (!(await usableAccount(userId))) return null;
  const token = randomBytes(32).toString("base64url");
  await prisma.loginToken.create({
    data: { tokenHash: hash(token), userId, createdById: adminId, expiresAt: new Date(Date.now() + LINK_TTL_MS) },
  });
  return token;
}

/** Whose link this is, without using it up (for the page that asks to confirm). */
export async function peekLoginToken(token: string): Promise<TestAccount | null> {
  const row = await prisma.loginToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!row || row.usedAt || row.expiresAt <= new Date()) return null;
  return usableAccount(row.userId);
}

/**
 * Uses the link up and returns the account to sign in as; null if it is spent, expired or
 * no longer allowed. The expiry is checked here, like every other token on the site, not
 * in SQL: comparing a zone-less timestamp column in the database depends on the server's
 * TimeZone setting, which turned a 10-minute link into one that was always expired.
 */
export async function consumeLoginToken(token: unknown): Promise<TestAccount | null> {
  if (typeof token !== "string" || token.length < 20) return null;
  const row = await prisma.loginToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!row || row.usedAt || row.expiresAt <= new Date()) return null;
  // Claim it: of two presses at once, only one finds usedAt still empty.
  const { count } = await prisma.loginToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (count === 0) return null;
  return usableAccount(row.userId);
}
