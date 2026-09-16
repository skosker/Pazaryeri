"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Directory filters. Every change rewrites the query string and drops the page number,
 * so a filter never lands the visitor on page 12 of a three-page result.
 */
export function FilterBar({
  selected,
}: {
  selected: { q: string; onlineOnly: boolean; proOnly: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(selected.q);

  function apply(changes: Record<string, string>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("sayfa");
    const search = params.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({ q: query.trim() });
        }}
        className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="İsim, meslek veya uzmanlık ara"
          className="w-full text-sm text-slate-600 outline-none placeholder:text-slate-400"
        />
        <button type="submit" className="text-sm font-semibold text-purple-700">
          Ara
        </button>
      </form>

      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={selected.onlineOnly}
          onChange={(e) => apply({ cevrimici: e.target.checked ? "1" : "" })}
          className="h-4 w-4 accent-purple-600"
        />
        Sadece çevrimiçi
      </label>

      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={selected.proOnly}
          onChange={(e) => apply({ pro: e.target.checked ? "1" : "" })}
          className="h-4 w-4 accent-purple-600"
        />
        Sadece Pro freelancer&apos;ları göster
      </label>
    </div>
  );
}
