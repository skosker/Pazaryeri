"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { ProPurchaseError, startProTrial } from "@/lib/pro-purchase";

export async function startProTrialAction() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/panel/pro-ol");

  try {
    await startProTrial(user.id);
  } catch (error) {
    if (!(error instanceof ProPurchaseError)) throw error;
    redirect("/panel/pro-ol?hata=deneme");
  }
  // Badges, ranking and the panel menu all change with membership.
  revalidatePath("/", "layout");
  redirect("/panel/pro-ol?deneme=basladi");
}
