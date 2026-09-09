"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format-price";

export type PeriodRow = { label: string; count: number; total: number };

type Period = "gunluk" | "haftalik" | "aylik";

const tabs: [Period, string][] = [
  ["gunluk", "Günlük"],
  ["haftalik", "Haftalık"],
  ["aylik", "Aylık"],
];

/**
 * Same three arrays, one table — only the active tab decides which rows render, so the
 * daily/weekly/monthly counts always add up to the same totals shown above.
 */
export function PeriodBreakdown({
  gunluk,
  haftalik,
  aylik,
}: {
  gunluk: PeriodRow[];
  haftalik: PeriodRow[];
  aylik: PeriodRow[];
}) {
  const [period, setPeriod] = useState<Period>("gunluk");
  const rows = { gunluk, haftalik, aylik }[period];

  return (
    <div>
      <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1 w-fit">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              period === value ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-80 overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-slate-100 bg-white text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Dönem</th>
              <th className="px-5 py-3 font-medium">Sipariş</th>
              <th className="px-5 py-3 font-medium text-right">Havale Tutarı</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-slate-100 last:border-0 ${row.count === 0 ? "text-slate-300" : ""}`}
              >
                <td className="px-5 py-3 font-medium text-brand-navy">{row.label}</td>
                <td className="px-5 py-3 text-slate-500">{row.count}</td>
                <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                  {row.total > 0 ? `${formatPrice(row.total)}₺` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
