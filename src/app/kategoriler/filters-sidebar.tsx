"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryAccent } from "@/lib/category-style";

type Category = { slug: string; name: string; icon: string };

const deliveryOptions = [
  { value: "1", label: "24 saat" },
  { value: "3", label: "3 gün" },
  { value: "farketmez", label: "Farketmez" },
];

export function FiltersSidebar({
  categories,
  selectedCategories,
  initialBudget,
  initialDelivery,
}: {
  categories: Category[];
  selectedCategories: string[];
  initialBudget: number;
  initialDelivery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [selected, setSelected] = useState<string[]>(selectedCategories);
  const [budget, setBudget] = useState(initialBudget);
  const [delivery, setDelivery] = useState(initialDelivery);

  const hasActiveFilters = selected.length > 0 || budget < 3000 || delivery !== "farketmez";

  function applyParams(next: { kategori?: string[]; butce?: number; sure?: string }) {
    const params = new URLSearchParams(window.location.search);
    params.delete("kategori");
    (next.kategori ?? selected).forEach((slug) => params.append("kategori", slug));

    const budgetValue = next.butce ?? budget;
    if (budgetValue < 3000) params.set("butce", String(budgetValue));
    else params.delete("butce");

    const deliveryValue = next.sure ?? delivery;
    if (deliveryValue !== "farketmez") params.set("sure", deliveryValue);
    else params.delete("sure");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleCategory(slug: string) {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    setSelected(next);
    applyParams({ kategori: next });
  }

  function clearAll() {
    setSelected([]);
    setBudget(3000);
    setDelivery("farketmez");
    const params = new URLSearchParams(window.location.search);
    params.delete("kategori");
    params.delete("butce");
    params.delete("sure");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <aside className="w-full shrink-0 space-y-7 rounded-2xl border border-slate-200 bg-white p-5 md:w-72">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-brand-navy">Filtreler</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-purple-700 hover:underline"
          >
            Temizle
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Kategori</h3>
        <div className="space-y-1">
          {categories.map((c) => {
            const accent = getCategoryAccent(c.slug);
            const checked = selected.includes(c.slug);
            return (
              <label
                key={c.slug}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition ${
                  checked ? "bg-purple-50/70 text-brand-navy" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(c.slug)}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                />
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                  <CategoryIcon icon={c.icon} className="h-4 w-4" />
                </span>
                <span className="truncate">{c.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Bütçe</h3>
        <input
          type="range"
          min={0}
          max={3000}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          onMouseUp={() => applyParams({})}
          onTouchEnd={() => applyParams({})}
          className="w-full accent-purple-600"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0₺</span>
          <span className="font-medium text-brand-navy">{budget >= 3000 ? "3000₺+" : `${budget}₺`}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Teslim Süresi</h3>
        <div className="flex flex-wrap gap-2">
          {deliveryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setDelivery(opt.value);
                applyParams({ sure: opt.value });
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                delivery === opt.value
                  ? "bg-brand-navy text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
