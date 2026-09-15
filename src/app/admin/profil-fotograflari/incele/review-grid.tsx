"use client";

import { useMemo, useState, useTransition } from "react";
import {
  revertOneProfilePhotoAction,
  revertDuplicatePhotosAction,
  revertProfilePhotosByNameAction,
} from "../actions";
import type { PhotoProfile } from "@/lib/profile-photos";

/**
 * The visual pass over the fetched photos. A stock search cannot guarantee who is in a
 * picture, so this is where a human decides: scan the grid, and drop any face that does
 * not fit to its drawn avatar. Reverted cards leave the grid immediately (optimistic), and
 * the count at the top tracks what is left — so "how many were wrong" is just what you
 * removed.
 *
 * `duplicate` cards (the exact same photo assigned to more than one profile) are outlined
 * and sorted first, since those have a definite right answer and a one-click bulk fix; the
 * rest is a judgment call, either card by card or by pasting a batch of names spotted while
 * scanning.
 */
export function ReviewGrid({ profiles }: { profiles: PhotoProfile[] }) {
  const [items, setItems] = useState(profiles);
  const [reverted, setReverted] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [namesText, setNamesText] = useState("");
  const [bulkPending, startBulkTransition] = useTransition();

  const duplicateCount = useMemo(() => items.filter((row) => row.duplicate).length, [items]);

  async function revert(id: string) {
    setPendingId(id);
    await revertOneProfilePhotoAction(id);
    setItems((rows) => rows.filter((row) => row.id !== id));
    setReverted((n) => n + 1);
    setPendingId(null);
  }

  function revertDuplicates() {
    startBulkTransition(async () => {
      const { reverted: count } = await revertDuplicatePhotosAction();
      setItems((rows) => rows.filter((row) => !row.duplicate));
      setReverted((n) => n + count);
    });
  }

  function revertByName() {
    startBulkTransition(async () => {
      const { reverted: count } = await revertProfilePhotosByNameAction(namesText);
      const wanted = new Set(
        namesText
          .split(/[,\n]/)
          .map((name) => name.trim().toLocaleLowerCase("tr"))
          .filter(Boolean)
      );
      setItems((rows) => rows.filter((row) => !wanted.has(row.name.trim().toLocaleLowerCase("tr"))));
      setReverted((n) => n + count);
      setNamesText("");
    });
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-col gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span>
            <span className="font-semibold text-brand-navy">{items.length}</span>{" "}
            <span className="text-slate-500">fotoğraflı profil kaldı</span>
          </span>
          {duplicateCount > 0 && (
            <span className="text-red-600">
              <span className="font-semibold">{duplicateCount}</span> tanesi başka bir profille
              aynı fotoğrafta
            </span>
          )}
          {reverted > 0 && (
            <span className="text-slate-500">
              · <span className="font-semibold text-emerald-600">{reverted}</span> tanesi avatara
              döndürüldü
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {duplicateCount > 0 && (
            <button
              type="button"
              onClick={revertDuplicates}
              disabled={bulkPending}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {bulkPending ? "..." : `${duplicateCount} tekrarlanan fotoğrafı avatara döndür`}
            </button>
          )}
          <input
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder="Gözüne takılan isimleri virgülle ayırarak yapıştır (ör. Tarık V., Baran C.)"
            className="min-w-64 flex-1 rounded-full border border-slate-300 px-3.5 py-1.5 text-xs outline-none focus:border-purple-400"
          />
          <button
            type="button"
            onClick={revertByName}
            disabled={bulkPending || namesText.trim().length === 0}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkPending ? "..." : "Bu isimleri avatara döndür"}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Fotoğraflı profil kalmadı.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((profile) => (
            <div
              key={profile.id}
              className={`flex flex-col items-center rounded-2xl border bg-white p-3 text-center ${
                profile.duplicate ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
              }`}
            >
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.image}
                  alt={profile.name}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-xl bg-slate-100 object-cover object-[50%_22%]"
                />
                {profile.duplicate && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Aynı foto
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-medium text-brand-navy" title={profile.name}>
                {profile.name}
              </p>
              <button
                type="button"
                onClick={() => revert(profile.id)}
                disabled={pendingId === profile.id}
                className="mt-2 w-full rounded-full border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {pendingId === profile.id ? "..." : "Avatara döndür"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
