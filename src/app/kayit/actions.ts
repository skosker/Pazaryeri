"use server";

import { redirect } from "next/navigation";
import { registerUser, RegisterError } from "@/lib/register-user";
import { cookies } from "next/headers";
import { REFERRAL_COOKIE } from "@/lib/referrals";

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
  // Ad and soyad are asked for separately and stored together as the account name.
  const firstName = String(formData.get("firstName") ?? "").trim().replace(/\s+/g, " ");
  const lastName = String(formData.get("lastName") ?? "").trim().replace(/\s+/g, " ");
  const name = firstName && lastName ? `${firstName} ${lastName}` : "";
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  try {
    const cookieStore = await cookies();
    await registerUser({
      referralCode: cookieStore.get(REFERRAL_COOKIE)?.value,
      name,
      email: String(email ?? ""),
      password: String(password ?? ""),
      role: role === "FREELANCER" ? "FREELANCER" : "BUYER",
      acceptedTerms: formData.get("acceptedTerms") === "on",
      company:
        role !== "FREELANCER" && formData.get("accountType") === "KURUMSAL"
          ? {
              companyName: String(formData.get("companyName") ?? ""),
              billingCity: String(formData.get("billingCity") ?? ""),
              billingDistrict: String(formData.get("billingDistrict") ?? ""),
              taxOffice: String(formData.get("taxOffice") ?? ""),
              taxNumber: String(formData.get("taxNumber") ?? ""),
              billingAddress: String(formData.get("billingAddress") ?? ""),
            }
          : undefined,
    });
  } catch (error) {
    if (error instanceof RegisterError) {
      const values: Record<string, string> = {};
      for (const key of [
        "firstName",
        "lastName",
        "email",
        "acceptedTerms",
        "accountType",
        "companyName",
        "billingCity",
        "billingDistrict",
        "taxOffice",
        "taxNumber",
        "billingAddress",
      ]) {
        values[key] = String(formData.get(key) ?? "");
      }
      return { error: error.message, values };
    }
    throw error;
  }

  redirect("/kayit/basarili");
}
