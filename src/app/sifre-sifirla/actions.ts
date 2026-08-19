"use server";

import { PasswordResetError, resetPassword } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validation";

export type ResetPasswordState = { error?: string; done?: boolean };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordAgain: formData.get("passwordAgain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  try {
    // The token is re-checked here rather than trusted from the page render: the link
    // could have been used or expired in the time the form sat open.
    await resetPassword(parsed.data.token, parsed.data.password);
    return { done: true };
  } catch (error) {
    if (error instanceof PasswordResetError) return { error: error.message };
    return { error: "Şifre değiştirilemedi, tekrar dene." };
  }
}
