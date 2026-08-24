"use server";

import { requireAdmin } from "@/lib/require-admin";
import {
  assignAiPortraits,
  aiPortraitProgress,
  resetAiPortraits,
  type AiPortraitBatch,
} from "@/lib/ai-portraits";

// Every export in a "use server" module is its own endpoint, so each authorises itself.

export type AiPortraitBatchResult =
  | { ok: true; batch: AiPortraitBatch }
  | { ok: false; error: string };

/**
 * One slice of the generation run. The page calls this repeatedly, passing back the index
 * it left off at, so no single request has to generate every portrait — each one takes a
 * few seconds and would otherwise time a serverless function out.
 */
export async function runAiPortraitBatch(
  force: boolean,
  startIndex: number
): Promise<AiPortraitBatchResult> {
  await requireAdmin();

  try {
    const batch = await assignAiPortraits({ force, startIndex, batchSize: 3 });
    return { ok: true, batch };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Beklenmeyen bir hata oldu",
    };
  }
}

export async function resetAiPortraitsAction() {
  await requireAdmin();

  try {
    const { reset } = await resetAiPortraits();
    return { ok: true as const, reset, progress: await aiPortraitProgress() };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Beklenmeyen bir hata oldu",
    };
  }
}
