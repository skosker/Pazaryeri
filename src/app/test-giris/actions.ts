"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

/** Signs in with a one-time test account link; a spent or expired one lands back on the page with a notice. */
export async function testLoginAction(token: string) {
  try {
    await signIn("test-login", { token, redirectTo: "/panel" });
  } catch (error) {
    if (error instanceof AuthError) redirect(`/test-giris?hata=${encodeURIComponent(error.type)}`);
    throw error;
  }
}
