"use server";

import { redirect } from "next/navigation";
import { registerUser, RegisterError } from "@/lib/register-user";

/**
 * `values` echoes what was typed (never the password) so the form can put it back:
 * React resets a form after its action runs, and without this one typo in the tax
 * number would wipe every field.
 */
export type FormState = { error?: string; values?: Record<string, string> };

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
      acceptedTerms: formData.get("acceptedTerms") === "on",
      company:
        role !== "FREELANCER" && formData.get("accountType") === "KURUMSAL"
          ? {
              companyName: String(formData.get("companyName") ?? ""),
              taxOffice: String(formData.get("taxOffice") ?? ""),
              taxNumber: String(formData.get("taxNumber") ?? ""),
              billingAddress: String(formData.get("billingAddress") ?? ""),
            }
          : undefined,
    });
  } catch (error) {
    if (error instanceof RegisterError) {
      const values: Record<string, string> = {};
      for (const key of ["name", "email", "acceptedTerms", "accountType", "companyName", "taxOffice", "taxNumber", "billingAddress"]) {
        values[key] = String(formData.get(key) ?? "");
      }
      return { error: error.message, values };
    }
    throw error;
  }

  redirect("/kayit/basarili");
}
