import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * Password reset by emailed link.
 *
 * The token is 32 random bytes; the database only ever sees its SHA-256, so a leaked
 * table dump cannot be turned into account access. A plain hash rather than bcrypt is
 * the right tool here: the secret is already full-entropy random, so there is nothing
 * for an attacker to guess and nothing for a slow hash to protect against.
 */

const TOKEN_TTL_MS = 1000 * 60 * 60; // an hour is plenty to click a link in your inbox

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Emails a reset link if the address belongs to an account.
 *
 * It never reports whether it did: telling a stranger which addresses are registered
 * turns this form into a way to enumerate the user list. Callers show the same message
 * either way.
 */
export async function requestPasswordReset(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (!user) return;

  const token = randomBytes(32).toString("hex");

  // Older links stop working the moment a new one is asked for, so a forwarded or
  // shoulder-surfed email cannot be used after the real owner requests another.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: `${appUrl}/sifre-sifirla?token=${token}`,
  });
}

export type ResetTokenState = "valid" | "invalid" | "expired" | "used";

async function findToken(token: string) {
  if (!token) return null;
  return prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
}

/** Used by the reset page so an expired link says so instead of failing on submit. */
export async function checkResetToken(token: string): Promise<ResetTokenState> {
  const record = await findToken(token);
  if (!record) return "invalid";
  if (record.usedAt) return "used";
  if (record.expiresAt < new Date()) return "expired";
  return "valid";
}

export class PasswordResetError extends Error {}

export async function resetPassword(token: string, newPassword: string) {
  const record = await findToken(token);

  if (!record) throw new PasswordResetError("Bağlantı geçersiz. Yeni bir sıfırlama isteği gönder.");
  if (record.usedAt) throw new PasswordResetError("Bu bağlantı zaten kullanılmış. Yeni bir istek gönder.");
  if (record.expiresAt < new Date()) {
    throw new PasswordResetError("Bağlantının süresi dolmuş. Yeni bir sıfırlama isteği gönder.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      // Clicking a link sent to the address proves the address works, so an account that
      // never confirmed its email is confirmed by this.
      data: { passwordHash, emailVerified: new Date() },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

/**
 * Changes the password of someone already signed in. The current password is required so
 * that a borrowed session cannot lock the real owner out of their own account.
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw new PasswordResetError("Hesap bulunamadı");

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw new PasswordResetError("Mevcut şifren doğru değil");

  const same = await bcrypt.compare(newPassword, user.passwordHash);
  if (same) throw new PasswordResetError("Yeni şifre eskisiyle aynı olamaz");

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    // Any reset link still in an inbox is now stale.
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
  ]);
}
