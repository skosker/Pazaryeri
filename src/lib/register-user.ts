import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validation";

export class RegisterError extends Error {}

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new RegisterError(parsed.error.issues[0]?.message ?? "Geçersiz form verisi");
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new RegisterError("Bu e-posta adresi zaten kayıtlı");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { name, email, passwordHash, role },
  });
}
