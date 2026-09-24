"use server";

import { revalidatePath } from "next/cache";
import { activeUser, INACTIVE_MESSAGE } from "@/lib/active-user";
import { CorporateError, requestTopUp } from "@/lib/corporate";

export type TopUpState = { error?: string; success?: boolean };

export async function requestTopUpAction(_prev: TopUpState, formData: FormData): Promise<TopUpState> {
  const user = await activeUser();
  if (!user) return { error: INACTIVE_MESSAGE };
  const amount = Number(String(formData.get("amount") ?? "").replace(/\./g, "").replace(",", "."));
  try {
    await requestTopUp(user.id, amount);
  } catch (error) {
    if (error instanceof CorporateError) return { error: error.message };
    throw error;
  }
  revalidatePath("/panel/kurumsal");
  return { success: true };
}
