"use server";

import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { adminConfirmProBankTransfer, ProPurchaseError } from "@/lib/pro-purchase";

export async function confirmProBankTransferAction(purchaseId: string) {
  const user = await activeUser();
  if (!user) return;

  try {
    await adminConfirmProBankTransfer(purchaseId, user.role);
  } catch (error) {
    if (!(error instanceof ProPurchaseError)) throw error;
  }

  revalidatePath("/admin/havale-onaylari");
}
