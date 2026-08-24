"use client";

import { useState } from "react";
import { runAiPortraitBatch, resetAiPortraitsAction } from "./actions";
import type { AiPortraitProgress } from "@/lib/ai-portraits";

/**
 * Drives the generation run from the browser: each round asks for a few more portraits,
 * handing back the index it stopped at, until every profile is covered. The work is spread
 * over many short requests instead of one long one, because a single generation takes a
 * few seconds and a thousand of them would never fit in one serverless call.
 */
export function AiPortraitRunner({
  initial,
  keyMissing,
}: {
  initial: AiPortraitProgress;
  keyMissing: boolean;
}) {
  const [progress, setProgress] = useState(initial);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [reverted, setReverted] = useState<number | null>(null);
  const [failed, setFailed] = useState(0);

  async function revert() {
    if (
      !confirm(
        "Bütün AI portreleri silinip profiller çizilen avatara döndürülecek. Sonra tekrar üretebilirsin. Devam edilsin mi?"
      )
    ) {
      return;
    }

    setRunning(true);
    setError(null);
    setFinished(false);
    setReverted(null);

    const result = await resetAiPortraitsAction();
    if (result.ok) {
      setProgress(result.progress);
      setReverted(result.reset);
    } else {
      setError(result.error);
    }

    setRunning(false);
  }

  async function run(force: boolean) {
    setRunning(true);
    setError(null);
    setFinished(false);
    setReverted(null);
    setFailed(0);

    let startIndex = 0;
    let totalFailed = 0;

    for (;;) {
      const result = await runAiPortraitBatch(force, startIndex);

      if (!result.ok) {
        setError(result.error);
        break;
      }

      const { batch } = result;
      totalFailed += batch.failed;
      setProgress(batch);
      setFailed(totalFailed);
      startIndex = batch.nextIndex;

      if (batch.rateLimited) {
        setError(batch.rateLimited);
        break;
      }

      // The sweep reached the end of the target list.
      if (batch.assigned === 0 && batch.failed === 0) {
        setFinished(true);
        break;
      }
      if (batch.pending === 0) {
        setFinished(true);
        break;
      }

      // Only the first pass may replace existing portraits; the rest fill the gaps.
      force = false;
    }

    setRunning(false);
  }

  const percent =
    progress.total === 0 ? 0 : Math.round((progress.withPortrait / progress.total) * 100);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-brand-navy">
          {progress.withPortrait} / {progress.total} profilin AI portresi var
        </p>
        <p className="text-sm text-slate-500">{progress.pending} profil bekliyor</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={running || keyMissing || progress.pending === 0}
          className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {running ? "Portreler üretiliyor…" : "Eksik portreleri üret"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={running || keyMissing}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Hepsini yeniden üret
        </button>
        <button
          type="button"
          onClick={revert}
          disabled={running || progress.withPortrait === 0}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Çizimlere dön
        </button>
      </div>

      {running && (
        <p className="mt-4 text-sm text-slate-500">
          Sayfayı açık tut — her turda birkaç portre üretilip atanıyor. Bin profil için bu
          bir süre alır ve arka planda ücret işler.
        </p>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {failed > 0 && !error && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {failed} portre üretilemedi; tekrar çalıştırınca yeniden denenir.
        </p>
      )}

      {reverted !== null && !error && (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {reverted} profil çizilen avatara döndürüldü. İstediğin zaman &quot;Eksik
          portreleri üret&quot; ile tekrar üretebilirsin.
        </p>
      )}

      {finished && !error && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tamamlandı. {progress.withPortrait} profil AI portresiyle görünüyor.
        </p>
      )}
    </div>
  );
}
