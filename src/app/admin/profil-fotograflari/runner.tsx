"use client";

import { useState } from "react";
import { runProfilePhotoBatch } from "./actions";
import type { ProfilePhotoProgress } from "@/lib/profile-photos";

/**
 * Drives the photo run from the browser: each click keeps calling the action, handing
 * back the search it stopped at, until the list of searches is used up. The work is
 * spread over several short requests instead of one long one that would time out.
 */
export function ProfilePhotoRunner({
  initial,
  keyMissing,
}: {
  initial: ProfilePhotoProgress;
  keyMissing: boolean;
}) {
  const [progress, setProgress] = useState(initial);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  async function run(force: boolean) {
    setRunning(true);
    setError(null);
    setFinished(false);
    setExhausted([]);

    const dead = new Set<string>();
    let startQuery = 0;
    let sweepFailures = 0;
    let retriedSweep = false;

    for (;;) {
      const result = await runProfilePhotoBatch(force, startQuery);

      if (!result.ok) {
        setError(result.error);
        break;
      }

      const { batch } = result;
      batch.exhausted.forEach((query) => dead.add(query));
      sweepFailures += batch.failed.length;
      setProgress(batch);
      setExhausted([...dead]);
      startQuery = batch.nextQuery;

      if (batch.rateLimited) {
        setError(batch.rateLimited);
        break;
      }

      if (batch.pending === 0) {
        setFinished(true);
        break;
      }

      if (batch.queriesRun === 0) {
        // The sweep is over. Searches that failed on the way may work now, so go round
        // once more for them — but not when every search simply ran out of photos.
        if (sweepFailures === 0 || retriedSweep) {
          setFinished(true);
          break;
        }
        retriedSweep = true;
        sweepFailures = 0;
        startQuery = 0;
      }

      // Only the first pass may replace existing photos; the rest fill the gaps.
      force = false;
    }

    setRunning(false);
  }

  const percent =
    progress.total === 0 ? 0 : Math.round((progress.withPhoto / progress.total) * 100);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-brand-navy">
          {progress.withPhoto} / {progress.total} profilin fotoğrafı var
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
          {running ? "Fotoğraflar çekiliyor…" : "Eksik fotoğrafları doldur"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={running || keyMissing}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Hepsini yeniden çek
        </button>
      </div>

      {running && (
        <p className="mt-4 text-sm text-slate-500">
          Sayfayı açık tut — her turda birkaç arama yapılıp fotoğraflar atanıyor.
        </p>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {finished && !error && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tamamlandı. {progress.withPhoto} profil gerçek portre fotoğrafıyla görünüyor.
        </p>
      )}

      {exhausted.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Bu aramalarda boşta fotoğraf kalmadı:</p>
          <p className="mt-1">{exhausted.join(", ")}</p>
          <p className="mt-1 text-amber-700">
            Fotoğraf düşmeyen profiller çizilen avatarla görünmeye devam eder.
          </p>
        </div>
      )}
    </div>
  );
}
