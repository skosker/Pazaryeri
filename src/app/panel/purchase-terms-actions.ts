"use server";

import { activeUser } from "@/lib/active-user";
import { acceptPurchaseTerms } from "@/lib/purchase-terms";

export async function acceptPurchaseTermsAction(kind: "uyelik" | "one-cikar", id: string) {
  const user = await activeUser();
  if (!user) return;
  await acceptPurchaseTerms(kind === "one-cikar" ? "one-cikar" : "uyelik", id, user.id);
}
