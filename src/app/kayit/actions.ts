"use server";

import { redirect } from "next/navigation";
import { registerUser, RegisterError } from "@/lib/register-user";

export type FormState = { error?: string };

export async function registerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  try {
    await registerUser({
      name: String(name ?? ""),
      email: String(email ?? ""),
      password: String(password ?? ""),
      role: role === "FREELANCER" ? "FREELANCER" : "BUYER",
    });
  } catch (error) {
    if (error instanceof RegisterError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/kayit/basarili");
}
