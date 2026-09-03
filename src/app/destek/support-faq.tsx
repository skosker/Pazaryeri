"use client";

import { useMemo, useState } from "react";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; icon: string; title: string; items: FaqItem[] };

/**
 * Search + accordion for the help-center groups below. Filtering happens client-side
 * over an already-small, fixed dataset (a few dozen Q&As), so there is no need for a
 * server round-trip — typing narrows both which groups show and which questions within
 * them match.
 */
export function SupportFaq({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.q.toLocaleLowerCase("tr-TR").includes(q) || item.a.toLocaleLowerCase("tr-TR").includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <div>
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <span aria-hidden className="text-slate-400">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bir soru yaz, ör. “havale” ya da “hakediş”"
            className="w-full text-sm text-brand-navy outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-purple-200 hover:text-purple-700"
          >
            <span aria-hidden>{group.icon}</span>
            {group.title}
          </a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Bu aramayla eşleşen bir soru bulamadık. Aşağıdan bize ulaşabilirsin.
        </p>
      ) : (
        <div className="mt-12 space-y-12">
          {filtered.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl">
                  {group.icon}
                </span>
                <h2 className="text-lg font-bold text-brand-navy">{group.title}</h2>
              </div>

              <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                {group.items.map((item) => {
                  const key = `${group.id}:${item.q}`;
                  const open = openKey === key;
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => setOpenKey(open ? null : key)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-brand-navy"
                      >
                        {item.q}
                        <span aria-hidden className={`shrink-0 text-slate-400 transition ${open ? "rotate-45" : ""}`}>
                          +
                        </span>
                      </button>
                      {open && <p className="px-5 pb-4 text-sm text-slate-500">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
