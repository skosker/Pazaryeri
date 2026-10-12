"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import {
  MAX_TEST_ACCOUNTS,
  TEST_EMAIL_DOMAIN,
  emailLocalPart,
  generatePassword,
  isBulkTestEmail,
  parseNames,
} from "@/lib/test-accounts";

export type CreatedAccount = { name: string; email: string; password: string };
export type TestAccountsState = {
  error?: string;
  created?: CreatedAccount[];
  existing?: { name: string; email: string }[];
};

/**
 * Opens a test account (buyer, isTester, already verified) for every name in the list,
 * as ad.soyad@test.prosinta.com — a number is added when that address is taken. Sending
 * the same list again does not open a second set: a test account with the same name on
 * that domain is reported back with its password left as it was.
 */
export async function createTestAccountsAction(
  _prev: TestAccountsState,
  formData: FormData
): Promise<TestAccountsState> {
  await requireAdmin();
  const names = parseNames(String(formData.get("names") ?? ""));
  if (names.length === 0) return { error: "En az bir ad soyad gir (her satıra bir kişi)." };
  if (names.length > MAX_TEST_ACCOUNTS) return { error: `Tek seferde en çok ${MAX_TEST_ACCOUNTS} hesap açılabilir.` };
  if (names.some((name) => name.length > 80)) return { error: "Ad soyad 80 karakteri geçemez." };

  const created: CreatedAccount[] = [];
  const existing: { name: string; email: string }[] = [];
  for (const name of names) {
    const base = emailLocalPart(name) || "test";
    const already = await prisma.user.findFirst({
      where: { name, isTester: true, email: { startsWith: base, endsWith: `@${TEST_EMAIL_DOMAIN}` } },
      select: { email: true },
    });
    if (already) {
      existing.push({ name, email: already.email });
      continue;
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    for (let n = 1; n < 100; n++) {
      const email = `${base}${n === 1 ? "" : n}@${TEST_EMAIL_DOMAIN}`;
      if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) continue;
      try {
        await prisma.user.create({
          data: { name, email, passwordHash, role: "BUYER", isTester: true, emailVerified: new Date() },
        });
        created.push({ name, email, password });
        break;
      } catch (error) {
        // Taken between the check and the insert: try the next number.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
        throw error;
      }
    }
  }

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/kullanicilar/test-hesaplari");
  return { created, existing };
}

/**
 * A new password for a bulk-opened test account. Its address has no mailbox, so
 * "Şifremi unuttum" cannot reach it; the admin hands this one out instead.
 */
export async function resetTestPasswordAction(userId: string): Promise<{ password?: string; error?: string }> {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isTester: true, email: true } });
  if (!user?.isTester || !isBulkTestEmail(user.email)) {
    return { error: "Yalnızca toplu açılan test hesaplarında kullanılabilir." };
  }
  const password = generatePassword();
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  return { password };
}
