import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { coverImageUrl } from "@/lib/cover-colors";
import { getCategoryAccent } from "@/lib/category-style";
import type { GigCardData } from "@/lib/gigs";

export function GigCard({ gig }: { gig: GigCardData }) {
  const accent = getCategoryAccent(gig.categorySlug);

  return (
    <Link
      href={`/gig/${gig.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/70"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImageUrl(gig.categorySlug, gig.slug)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
            {gig.seller.name.charAt(0)}
            {gig.seller.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </span>
          <span className="text-sm font-medium text-white drop-shadow">{gig.seller.name}</span>
          {gig.seller.isPro && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-sm">
              Pro
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span
          className={`inline-block w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${accent.bg} ${accent.text}`}
        >
          {gig.categoryName}
        </span>
        <h3 className="mt-1 line-clamp-2 font-medium text-brand-navy group-hover:text-purple-700">
          {gig.title}
        </h3>

        <div className="mt-2">
          {gig.rating !== null ? (
            <StarRating rating={gig.rating} count={gig.reviewCount} />
          ) : (
            <span className="text-sm text-slate-400">Henüz değerlendirme yok</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-400">Başlangıç fiyatı</span>
          <span className="text-lg font-extrabold text-brand-navy">{gig.startingPrice}₺</span>
        </div>
      </div>
    </Link>
  );
}
