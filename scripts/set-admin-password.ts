import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Sets (or resets) an admin account's password.
 *
 *   npm run admin:sifre -- admin@profestia.dev 'yeni-sifre'
 *
 * The password is read from argv rather than a prompt so it can run in CI, which
 * means it lands in shell history — use a throwaway value and change it later, or
 * prefix the command with a space if your shell is set to skip those.
 */
async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Kullanım: npm run admin:sifre -- <e-posta> <yeni-sifre>");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Şifre en az 10 karakter olmalı.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Böyle bir kullanıcı yok: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      emailVerified: user.emailVerified ?? new Date(),
      suspended: false,
    },
  });

  console.log(`${email} artık ADMIN ve yeni şifresiyle giriş yapabilir.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
