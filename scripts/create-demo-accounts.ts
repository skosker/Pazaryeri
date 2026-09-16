import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Creates (or resets) a ready-to-use demo Alıcı and Freelancer account — already
 * email-verified, so they can log in immediately without the registration email step.
 *
 *   npm run demo:hesap -- 'yeni-sifre'
 *
 * The password defaults to Demo1234! and is read from argv rather than a prompt so it
 * can run non-interactively; use a throwaway value and change it later if it matters.
 */
async function main() {
  const password = process.argv[2] ?? "Demo1234!";
  const passwordHash = await bcrypt.hash(password, 10);
  const emailVerified = new Date();

  const buyer = await prisma.user.upsert({
    where: { email: "demo-alici@prosinta.com" },
    update: { passwordHash, emailVerified, suspended: false, role: "BUYER" },
    create: {
      name: "Demo Alıcı",
      email: "demo-alici@prosinta.com",
      passwordHash,
      role: "BUYER",
      emailVerified,
    },
  });

  const freelancer = await prisma.user.upsert({
    where: { email: "demo-freelancer@prosinta.com" },
    update: { passwordHash, emailVerified, suspended: false, role: "FREELANCER" },
    create: {
      name: "Demo Freelancer",
      email: "demo-freelancer@prosinta.com",
      passwordHash,
      role: "FREELANCER",
      emailVerified,
    },
  });

  console.log(`Alıcı:      ${buyer.email} / ${password}`);
  console.log(`Freelancer: ${freelancer.email} / ${password}`);
}

main().finally(() => prisma.$disconnect());
