"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryAccent } from "@/lib/category-style";

type Category = { slug: string; name: string; icon: string };
type Subcategory = { name: string; slug: string };

const deliveryOptions = [
  { value: "1", label: "24 saat" },
  { value: "3", label: "3 gün" },
  { value: "farketmez", label: "Farketmez" },
];

export function FiltersSidebar({
  categories,
  subcategoriesByCategory,
  selectedCategories,
  selectedSubcategories,
  initialBudget,
  initialDelivery,
}: {
  categories: Category[];
  subcategoriesByCategory: Record<string, Subcategory[]>;
  selectedCategories: string[];
  selectedSubcategories: string[];
  initialBudget: number;
  initialDelivery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [selected, setSelected] = useState<string[]>(selectedCategories);
  const [selectedSub, setSelectedSub] = useState<string[]>(selectedSubcategories);
  const [budget, setBudget] = useState(initialBudget);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set(
        categories
          .filter(
            (c) =>
              selectedCategories.includes(c.slug) ||
              (subcategoriesByCategory[c.slug] ?? []).some((sc) => selectedSubcategories.includes(sc.slug))
          )
          .map((c) => c.slug)
      )
  );

  const hasActiveFilters =
    selected.length > 0 || selectedSub.length > 0 || budget < 3000 || delivery !== "farketmez";

  function applyParams(next: { kategori?: string[]; alt?: string[]; butce?: number; sure?: string }) {
    const params = new URLSearchParams(window.location.search);
    params.delete("kategori");
    (next.kategori ?? selected).forEach((slug) => params.append("kategori", slug));

    params.delete("alt");
    (next.alt ?? selectedSub).forEach((slug) => params.append("alt", slug));

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

  function toggleSubcategory(slug: string) {
    const next = selectedSub.includes(slug)
      ? selectedSub.filter((s) => s !== slug)
      : [...selectedSub, slug];
    setSelectedSub(next);
    applyParams({ alt: next });
  }

  function toggleExpanded(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function clearAll() {
    setSelected([]);
    setSelectedSub([]);
    setBudget(3000);
    setDelivery("farketmez");
    const params = new URLSearchParams(window.location.search);
    params.delete("kategori");
    params.delete("alt");
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
            const subs = subcategoriesByCategory[c.slug] ?? [];
            const isExpanded = expanded.has(c.slug);
            return (
              <div key={c.slug}>
                <div
                  className={`flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm transition ${
                    checked ? "bg-purple-50/70 text-brand-navy" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5">
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
                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(c.slug)}
                      aria-label={isExpanded ? "Alt kategorileri gizle" : "Alt kategorileri göster"}
                      className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {isExpanded && subs.length > 0 && (
                  <div className="ml-9 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
                    {subs.map((sc) => {
                      const subChecked = selectedSub.includes(sc.slug);
                      return (
                        <label
                          key={sc.slug}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                            subChecked ? "bg-purple-50/70 text-brand-navy" : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={subChecked}
                            onChange={() => toggleSubcategory(sc.slug)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                          />
                          <span className="truncate">{sc.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
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
