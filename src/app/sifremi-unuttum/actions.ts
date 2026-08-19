"use server";

import { requestPasswordReset } from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validation";

export type ForgotPasswordState = { error?: string; sent?: boolean };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta" };
  }

  await requestPasswordReset(parsed.data.email);

  // Always the same answer, whether or not that address has an account: anything else
  // turns this form into a way of finding out who is registered.
  return { sent: true };
}
