"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type FormState = { error?: string };

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");

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
