"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Directory filters. Every change rewrites the query string and drops the page number,
 * so a filter never lands the visitor on page 12 of a three-page result.
 */
export function FilterBar({
  titles,
  selected,
}: {
  titles: { name: string; count: number }[];
  selected: { q: string; title: string; onlineOnly: boolean };
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

  const selectClass =
    "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 outline-none focus:border-purple-400";

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

      <select value={selected.title} onChange={(e) => apply({ meslek: e.target.value })} className={selectClass}>
        <option value="">Tüm meslekler</option>
        {titles.map((title) => (
          <option key={title.name} value={title.name}>
            {title.name} ({title.count})
          </option>
        ))}
      </select>

      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={selected.onlineOnly}
          onChange={(e) => apply({ cevrimici: e.target.checked ? "1" : "" })}
          className="h-4 w-4 accent-purple-600"
        />
        Sadece çevrimiçi
      </label>
    </div>
  );
}
