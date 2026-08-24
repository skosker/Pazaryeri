"use client";

import { useState, useTransition } from "react";
import { revertOneProfilePhotoAction } from "../actions";
import type { PhotoProfile } from "@/lib/profile-photos";

/**
 * The visual pass over the fetched photos. A stock search cannot guarantee who is in a
 * picture, so this is where a human decides: scan the grid, and drop any face that does
 * not fit to its drawn avatar. Reverted cards leave the grid immediately (optimistic), and
 * the count at the top tracks what is left — so "how many were wrong" is just what you
 * removed.
 */
export function ReviewGrid({ profiles }: { profiles: PhotoProfile[] }) {
  const [items, setItems] = useState(profiles);
  const [reverted, setReverted] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function revert(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await revertOneProfilePhotoAction(id);
      setItems((rows) => rows.filter((row) => row.id !== id));
      setReverted((n) => n + 1);
      setPendingId(null);
    });
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
        <span className="font-semibold text-brand-navy">{items.length}</span>
        <span className="text-slate-500">fotoğraflı profil kaldı</span>
        {reverted > 0 && (
          <span className="text-slate-500">
            · <span className="font-semibold text-emerald-600">{reverted}</span> tanesi avatara
            döndürüldü
          </span>
        )}
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
              className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-3 text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.image}
                alt={profile.name}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-xl bg-slate-100 object-cover object-[50%_22%]"
              />
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
