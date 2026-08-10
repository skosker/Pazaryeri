"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryAccent } from "@/lib/category-style";

type Category = { slug: string; name: string; icon: string };
type Subcategory = { name: string; slug: string };

export function CategoryMegaMenu({
  categories,
  subcategoriesByCategory,
}: {
  categories: Category[];
  subcategoriesByCategory: Record<string, Subcategory[]>;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const activeSubcategories = subcategoriesByCategory[active] ?? [];

  return (
    <div ref={containerRef} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 transition hover:text-brand-navy"
      >
        Kategoriler
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

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 flex w-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="w-64 shrink-0 border-r border-slate-100 bg-slate-50/60 py-2">
            {categories.map((c) => {
              const accent = getCategoryAccent(c.slug);
              const isActive = c.slug === active;
              return (
                <Link
                  key={c.slug}
                  href={`/kategoriler?kategori=${c.slug}`}
                  onMouseEnter={() => setActive(c.slug)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-white text-brand-navy" : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${accent.bg} ${accent.text}`}>
                    <CategoryIcon icon={c.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{c.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex-1 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {categories.find((c) => c.slug === active)?.name}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {activeSubcategories.map((sc) => (
                <Link
                  key={sc.slug}
                  href={`/kategoriler?kategori=${active}&alt=${sc.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy"
                >
                  {sc.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
