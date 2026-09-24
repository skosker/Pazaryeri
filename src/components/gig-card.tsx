import Link from "next/link";
import { GigCover } from "@/components/gig-cover";
import { UserAvatar } from "@/components/user-avatar";
import { getCategoryAccent } from "@/lib/category-style";
import type { GigCardData } from "@/lib/gigs";
import { formatPrice } from "@/lib/format-price";
import { FounderBadge } from "@/components/founder-badge";

export function GigCard({ gig }: { gig: GigCardData }) {
  const accent = getCategoryAccent(gig.categorySlug);

  return (
    <Link
      href={`/gig/${gig.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/70"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <GigCover
          categoryIcon={gig.categoryIcon}
          gigSlug={gig.slug}
          coverImage={gig.coverImage}
          imageClassName="transition duration-500 group-hover:scale-110"
        />
        {gig.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-navy/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            ✦ Editör Seçkisi
          </span>
        )}
        {gig.campaign && (
          <span className="absolute bottom-3 right-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {gig.campaign.name} −%{gig.campaign.percent}
          </span>
        )}
        {gig.sponsored && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">
            Sponsorlu
          </span>
        )}
        {gig.rating !== null && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-navy shadow-sm">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
            </svg>
            {gig.rating.toFixed(2)}
            <span className="font-normal text-slate-400">({gig.reviewCount})</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative block h-8 w-8 shrink-0">
              <UserAvatar
                name={gig.seller.name}
                image={gig.seller.image}
                className="h-8 w-8 text-xs"
                fallbackClassName="bg-slate-200 text-slate-600"
              />
              {gig.seller.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-sm font-semibold text-brand-navy">
                {gig.seller.name}
                {gig.seller.emailVerified && (
                  <span title="E-posta doğrulandı" className="text-emerald-500">
                    ✓
                  </span>
                )}
              </p>
              {gig.seller.title && (
                <p className="truncate text-xs text-slate-400">{gig.seller.title}</p>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            {gig.campaign && (
              <p className="text-[11px] text-slate-400 line-through">{formatPrice(gig.campaign.listPrice)}₺</p>
            )}
            <p className={`text-base font-extrabold ${gig.campaign ? "text-rose-600" : "text-brand-navy"}`}>
              {formatPrice(gig.startingPrice)}₺
            </p>
            <p className="text-[11px] text-slate-400">Başlangıç</p>
          </div>
        </div>

        <span
          className={`mt-3 inline-block w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${accent.bg} ${accent.text}`}
        >
          {gig.categoryName}
        </span>
        <h3 className="mt-1.5 line-clamp-2 font-medium text-brand-navy group-hover:text-purple-700">
          {gig.title}
        </h3>
        {(gig.seller.isPro || gig.seller.isFounder) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {gig.seller.isFounder && <FounderBadge compact />}
            {gig.seller.isPro && (
              <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Pro
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
