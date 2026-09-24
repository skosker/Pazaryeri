"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { confirmTopUp, rejectTopUp } from "@/lib/corporate";

export async function confirmTopUpAction(topUpId: string) {
  await requireAdmin();
  await confirmTopUp(topUpId);
  revalidatePath("/admin/kurumsal");
}

export async function rejectTopUpAction(topUpId: string) {
  await requireAdmin();
  await rejectTopUp(topUpId);
  revalidatePath("/admin/kurumsal");
}
