"use server";

import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type FormState = { error?: string; done?: boolean };

function tokenMatches(supplied: string, expected: string) {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which would itself leak length.
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * One-off admin recovery for deployments where nobody can reach the database
 * directly (Vercel marks DATABASE_URL as sensitive, so it cannot be read back).
 *
 * The gate is ADMIN_SETUP_TOKEN: with the variable unset the page 404s, so the
 * route only exists while an operator has deliberately opened it. Remove the
 * variable once a password is set and the door closes again.
 */
export async function setAdminPasswordAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) return { error: "Kurulum kapalı." };

  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!tokenMatches(token, expected)) return { error: "Kurulum anahtarı hatalı." };
  if (!email) return { error: "E-posta girin." };
  if (password.length < 10) return { error: "Şifre en az 10 karakter olmalı." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: `Böyle bir kullanıcı yok: ${email}` };

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      emailVerified: user.emailVerified ?? new Date(),
      suspended: false,
    },
  });

  return { done: true };
}
