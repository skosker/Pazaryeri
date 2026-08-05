import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { coverGradientClass } from "@/lib/cover-colors";
import type { GigCardData } from "@/lib/gigs";

export function GigCard({ gig }: { gig: GigCardData }) {
  return (
    <Link
      href={`/gig/${gig.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-100"
    >
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br ${coverGradientClass(
          gig.coverColor
        )}`}
      >
        <span className="rotate-[-8deg] text-xs font-semibold uppercase tracking-widest text-white/70">
          Gig Görseli
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
            {gig.seller.name.charAt(0)}
          </span>
          {gig.seller.name}
        </div>
        <h3 className="line-clamp-2 font-medium text-brand-navy group-hover:text-purple-700">
          {gig.title}
        </h3>
        {gig.rating !== null ? (
          <StarRating rating={gig.rating} count={gig.reviewCount} />
        ) : (
          <span className="text-sm text-slate-400">Henüz değerlendirme yok</span>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {gig.categoryName}
          </span>
          <span className="text-slate-500">
            Başlangıç{" "}
            <span className="text-base font-bold text-brand-navy">
              {gig.startingPrice}₺
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
