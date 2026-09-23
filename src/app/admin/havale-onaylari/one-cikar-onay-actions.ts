"use server";

import { revalidatePath } from "next/cache";
import { activeUser } from "@/lib/active-user";
import { adminConfirmBoostBankTransfer, GigBoostError } from "@/lib/gig-boost";

export async function confirmBoostBankTransferAction(boostId: string) {
  const user = await activeUser();
  if (!user) return;

  try {
    await adminConfirmBoostBankTransfer(boostId, user.role);
  } catch (error) {
    if (!(error instanceof GigBoostError)) throw error;
  }

  revalidatePath("/admin/havale-onaylari");
}
