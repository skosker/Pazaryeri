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
  const wantsToSell = formData.get("niyet") === "satici";

  try {
    await registerUser({
      name: String(name ?? ""),
      email: String(email ?? ""),
      password: String(password ?? ""),
      // Sellers convert from the panel after verifying their address.
      role: "BUYER",
    });
  } catch (error) {
    if (error instanceof RegisterError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(wantsToSell ? "/kayit/basarili?satici=1" : "/kayit/basarili");
}
