"use client";

import Link from "next/link";
import { useState } from "react";
import { StarRating } from "@/components/star-rating";

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  buyerName: string;
  gigTitle: string;
  gigSlug: string;
};

type Filter = "all" | "positive" | "negative";

/** A star row for the big aggregate number — five fixed stars, filled up to the
 * rounded rating. Distinct from StarRating, which is the small inline "4.8/5 (12)" tag
 * used elsewhere; this one is sized for a headline number. */
function StarRow({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex justify-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-5 w-5 ${i < filled ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Total review count and average come from every review this seller has (a plain
 * aggregate query), so they stay accurate regardless of the filter below. The
 * Tümü/Olumlu/Olumsuz tabs only narrow which of the already-fetched reviews render —
 * "Olumlu" is 4-5 stars, "Olumsuz" is 1-2 stars, matching how buyers read a rating.
 */
export function ReviewSummary({
  reviews,
  total,
  average,
}: {
  reviews: ReviewRow[];
  total: number;
  average: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = reviews.filter((r) => {
    if (filter === "positive") return r.rating >= 4;
    if (filter === "negative") return r.rating <= 2;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 sm:flex-row">
        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-brand-navy">Beğeni ve Yorumlar</h2>
            <div className="flex gap-2 rounded-full border border-slate-200 p-1">
              {(
                [
                  ["all", "Tümü"],
                  ["positive", "Olumlu"],
                  ["negative", "Olumsuz"],
                ] as [Filter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    filter === value ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center border-t border-slate-100 p-6 sm:w-56 sm:border-l sm:border-t-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Toplam</p>
          <p className="mt-1 text-sm font-semibold text-brand-navy">{total} değerlendirme</p>
          <p className="mt-2 text-4xl font-extrabold text-amber-500">{average.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400">5 üzerinden</p>
          <div className="mt-2">
            <StarRow rating={average} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          Bu filtreye uyan bir değerlendirme yok.
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {filtered.map((review) => (
            <li key={review.id} className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-navy">{review.buyerName}</p>
                <StarRating rating={review.rating} />
              </div>
              <Link
                href={`/gig/${review.gigSlug}`}
                className="mt-0.5 inline-block text-xs text-slate-400 hover:text-purple-700"
              >
                {review.gigTitle}
              </Link>
              <p className="mt-1.5 text-sm text-slate-600">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
