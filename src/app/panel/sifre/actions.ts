"use server";

import { auth } from "@/auth";
import { changePassword, PasswordResetError } from "@/lib/password-reset";
import { changePasswordSchema } from "@/lib/validation";

export type ChangePasswordState = { error?: string; done?: boolean };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  // Every export in a "use server" module is its own endpoint, so the session is checked
  // here rather than relying on the page that renders the form.
  const session = await auth();
  if (!session?.user) return { error: "Oturumun sona ermiş, tekrar giriş yap." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    passwordAgain: formData.get("passwordAgain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi" };
  }

  try {
    await changePassword(session.user.id, parsed.data.currentPassword, parsed.data.password);
    return { done: true };
  } catch (error) {
    if (error instanceof PasswordResetError) return { error: error.message };
    return { error: "Şifre değiştirilemedi, tekrar dene." };
  }
}
