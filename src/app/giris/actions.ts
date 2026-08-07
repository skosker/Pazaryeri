"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type FormState = { error?: string };

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email === "string" && typeof password === "string") {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid && !user.emailVerified) {
        return {
          error: "E-postanı henüz doğrulamadın. Gelen kutunu kontrol et ve doğrulama linkine tıkla.",
        };
      }
      if (isValid && user.suspended) {
        return { error: "Hesabın askıya alındı. Destek ekibiyle iletişime geç." };
      }
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/panel",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "E-posta veya şifre hatalı" };
      }
      return { error: "Giriş yapılamadı, tekrar deneyin" };
    }
    throw error;
  }
}
