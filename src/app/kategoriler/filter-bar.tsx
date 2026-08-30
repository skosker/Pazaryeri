"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { subcategoryEmoji } from "@/components/subcategory-icon";
import { getCategoryAccent } from "@/lib/category-style";
import { formatPrice } from "@/lib/format-price";

type Category = { slug: string; name: string; icon: string };
type Subcategory = { name: string; slug: string };

const deliveryOptions = [
  { value: "1", label: "1 gün" },
  { value: "3", label: "3 gün" },
  { value: "5", label: "5 gün" },
  { value: "7", label: "1 Hafta" },
  { value: "10", label: "10 gün" },
  { value: "farketmez", label: "Farketmez" },
];

export function FilterBar({
  categories,
  subcategoriesByCategory,
  selectedCategories,
  selectedSubcategories,
  initialBudget,
  initialDelivery,
  initialOnlineOnly,
  isProBuyer,
  initialProOnly,
}: {
  categories: Category[];
  subcategoriesByCategory: Record<string, Subcategory[]>;
  selectedCategories: string[];
  selectedSubcategories: string[];
  initialBudget: number;
  initialDelivery: string;
  initialOnlineOnly: boolean;
  isProBuyer?: boolean;
  initialProOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const [openPanel, setOpenPanel] = useState<"kategori" | "butce" | "sure" | null>(null);
  const [selected, setSelected] = useState(selectedCategories);
  const [selectedSub, setSelectedSub] = useState(selectedSubcategories);
  const [budget, setBudget] = useState(initialBudget);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [onlineOnly, setOnlineOnly] = useState(initialOnlineOnly);
  const [proOnly, setProOnly] = useState(initialProOnly ?? false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPanel(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function applyParams(next: {
    kategori?: string[];
    alt?: string[];
    butce?: number;
    sure?: string;
    cevrimici?: boolean;
    proOnly?: boolean;
  }) {
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

    const onlineValue = next.cevrimici ?? onlineOnly;
    if (onlineValue) params.set("cevrimici", "1");
    else params.delete("cevrimici");

    const proValue = next.proOnly ?? proOnly;
    if (proValue) params.set("pro", "1");
    else params.delete("pro");

    params.delete("sayfa");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleCategory(slug: string) {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    setSelected(next);
    applyParams({ kategori: next });
  }

  function toggleSubcategory(slug: string) {
    const next = selectedSub.includes(slug) ? selectedSub.filter((s) => s !== slug) : [...selectedSub, slug];
    setSelectedSub(next);
    applyParams({ alt: next });
  }

  const categoryCount = selected.length + selectedSub.length;
  const budgetActive = budget < 3000;
  const deliveryActive = delivery !== "farketmez";

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterButton
          label="Kategori"
          active={categoryCount > 0}
          badge={categoryCount > 0 ? categoryCount : undefined}
          open={openPanel === "kategori"}
          onClick={() => setOpenPanel((p) => (p === "kategori" ? null : "kategori"))}
        />
        <FilterButton
          label="Bütçe"
          active={budgetActive}
          open={openPanel === "butce"}
          onClick={() => setOpenPanel((p) => (p === "butce" ? null : "butce"))}
        />
        <FilterButton
          label="Teslim Süresi"
          active={deliveryActive}
          open={openPanel === "sure"}
          onClick={() => setOpenPanel((p) => (p === "sure" ? null : "sure"))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {isProBuyer && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            Sadece Pro freelancer&apos;ları göster
            <span
              role="switch"
              aria-checked={proOnly}
              onClick={() => {
                const next = !proOnly;
                setProOnly(next);
                applyParams({ proOnly: next });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                proOnly ? "bg-amber-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition ${
                  proOnly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </label>
        )}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
          Çevrimiçi freelancer&apos;ların ilanlarını göster
          <span
            role="switch"
            aria-checked={onlineOnly}
            onClick={() => {
              const next = !onlineOnly;
              setOnlineOnly(next);
              applyParams({ cevrimici: next });
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              onlineOnly ? "bg-emerald-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition ${
                onlineOnly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </label>
      </div>

      {openPanel === "kategori" && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-[26rem] w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
          {categories.map((c) => {
            const accent = getCategoryAccent(c.slug);
            const checked = selected.includes(c.slug);
            const subs = subcategoriesByCategory[c.slug] ?? [];
            const isExpanded = expandedCategory === c.slug;
            return (
              <div key={c.slug}>
                <div className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm hover:bg-slate-50">
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.slug)}
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                      <CategoryIcon icon={c.icon} className="text-lg" />
                    </span>
                    <span className="truncate text-slate-700">{c.name}</span>
                  </label>
                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isExpanded ? null : c.slug)}
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
                  <div className="ml-8 mb-1 space-y-0.5 border-l border-slate-100 pl-3">
                    {subs.map((sc) => (
                      <label
                        key={sc.slug}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSub.includes(sc.slug)}
                          onChange={() => toggleSubcategory(sc.slug)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                        />
                        <span className="shrink-0" aria-hidden>
                          {subcategoryEmoji(sc.name, c.icon)}
                        </span>
                        <span className="truncate">{sc.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openPanel === "butce" && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
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
            <span className="font-medium text-brand-navy">{budget >= 3000 ? `${formatPrice(3000)}₺+` : `${formatPrice(budget)}₺`}</span>
          </div>
        </div>
      )}

      {openPanel === "sure" && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
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
                  delivery === opt.value ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  badge,
  open,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-purple-300 bg-purple-50 text-purple-700"
          : "border-slate-300 text-brand-navy hover:bg-slate-50"
      }`}
    >
      {label}
      {badge !== undefined && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <svg
        className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
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
  );
}
