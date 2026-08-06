"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { CategoryIcon } from "@/components/category-icon";

type Category = { slug: string; name: string; icon: string };

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

  return (
    <aside className="w-full shrink-0 space-y-8 rounded-2xl border border-slate-200 bg-white p-5 md:w-64">
      <div>
        <h3 className="mb-3 font-semibold text-brand-navy">Kategori</h3>
        <div className="space-y-1">
          {categories.map((c) => (
            <label
              key={c.slug}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(c.slug)}
                onChange={() => toggleCategory(c.slug)}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
              />
              <CategoryIcon icon={c.icon} className="h-4 w-4 text-slate-400" />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-brand-navy">Bütçe</h3>
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
          <span>{budget >= 3000 ? "3000₺+" : `${budget}₺`}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-brand-navy">Teslim Süresi</h3>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            { value: "1", label: "24 saat" },
            { value: "3", label: "3 gün" },
            { value: "farketmez", label: "Farketmez" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="sure"
                checked={delivery === opt.value}
                onChange={() => {
                  setDelivery(opt.value);
                  applyParams({ sure: opt.value });
                }}
                className="h-4 w-4 border-slate-300 text-purple-600 focus:ring-purple-400"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
