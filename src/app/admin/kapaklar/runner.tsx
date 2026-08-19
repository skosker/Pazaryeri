"use client";

import { useState } from "react";
import { runCoverPhotoBatch } from "./actions";
import type { CoverPhotoProgress } from "@/lib/cover-photos";

/**
 * Drives the photo run from the browser: each click keeps calling the action until no
 * listings are left, so the work is spread over several short requests instead of one
 * long one that would time out.
 */
export function CoverPhotoRunner({
  initial,
  keyMissing,
}: {
  initial: CoverPhotoProgress;
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
    let emptyRounds = 0;

    for (;;) {
      const result = await runCoverPhotoBatch(force);

      if (!result.ok) {
        setError(result.error);
        break;
      }

      const { batch } = result;
      batch.exhausted.forEach((query) => dead.add(query));
      setProgress(batch);
      setExhausted([...dead]);

      if (batch.rateLimited) {
        setError(batch.rateLimited);
        break;
      }

      if (batch.pending === 0) {
        setFinished(true);
        break;
      }

      // A round that places nothing is usually every remaining term being out of unused
      // photos, but it can also be a bad minute at Pexels — so give it one more round
      // before calling it done rather than stopping on the first empty one.
      emptyRounds = batch.assigned === 0 ? emptyRounds + 1 : 0;
      if (emptyRounds >= 2) {
        setFinished(true);
        break;
      }

      // Only the first pass may replace existing photos; the rest just fill the gaps.
      force = false;
    }

    setRunning(false);
  }

  const done = progress.total - progress.pending;
  const percent = progress.total === 0 ? 0 : Math.round((done / progress.total) * 100);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-brand-navy">
          {progress.withPhoto} / {progress.total} ilanın fotoğrafı var
        </p>
        <p className="text-sm text-slate-500">
          {progress.sellerUploads > 0 && `${progress.sellerUploads} satıcı yüklemesi korunuyor · `}
          {progress.pending} ilan bekliyor
        </p>
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
          {running ? "Fotoğraflar çekiliyor…" : "Eksik kapakları doldur"}
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
          Sayfayı açık tut — her turda bir grup arama yapılıp fotoğraflar atanıyor.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {finished && !error && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tamamlandı. {progress.withPhoto} ilan fotoğraflı kapakla yayında.
        </p>
      )}

      {exhausted.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Bu aramalarda boşta fotoğraf kalmadı:</p>
          <p className="mt-1">{exhausted.join(", ")}</p>
          <p className="mt-1 text-amber-700">
            O ilanlar çizimli kapakla kalıyor; istersen satıcı kendi görselini yükleyebilir.
          </p>
        </div>
      )}
    </div>
  );
}
