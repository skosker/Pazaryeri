"use client";

import { useState } from "react";
import Link from "next/link";
import { orderAction } from "./actions";
import { formatPrice } from "@/lib/format-price";

export type PackageOption = {
  id: string;
  tier: string;
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  features: string[];
};

const tierLabels: Record<string, string> = {
  BASIC: "Temel",
  STANDARD: "Standart",
  PREMIUM: "Premium",
};

export function OrderPanel({
  slug,
  packages,
  isOwnGig,
  acceptingOrders,
  firstOrderOffer,
  campaign,
  messageHref,
}: {
  slug: string;
  packages: PackageOption[];
  isOwnGig: boolean;
  acceptingOrders: boolean;
  /** Shown above the order button when the visitor would get the first-order discount. */
  firstOrderOffer: { percent: number; maxTl: number } | null;
  /** A live seasonal campaign this gig joined: prices shown (and charged) with it applied. */
  campaign: { name: string; percent: number } | null;
  /** Null hides the button: the viewer's own gig, or a showcase seller nobody would answer for. */
  messageHref: string | null;
}) {
  // Default to the middle tier when there is a full ladder, otherwise the cheapest.
  const defaultIndex = packages.length === 3 ? 1 : 0;
  const [selected, setSelected] = useState(defaultIndex);
  const pkg = packages[selected] ?? packages[0];

  if (!pkg) return null;
  const price = campaign ? Math.round((pkg.price * (100 - campaign.percent)) / 100) : pkg.price;

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {packages.length > 1 && (
        <div className="flex border-b border-slate-200" role="tablist">
          {packages.map((p, i) => {
            const isActive = i === selected;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelected(i)}
                className={`flex-1 border-b-2 px-2 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-500 hover:text-brand-navy"
                }`}
              >
                {tierLabels[p.tier] ?? p.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">{pkg.name}</h2>
          <div className="text-right">
            {campaign && (
              <span className="mr-2 text-sm text-slate-400 line-through">{formatPrice(pkg.price)}₺</span>
            )}
            <span className={`text-2xl font-extrabold ${campaign ? "text-rose-600" : "text-brand-navy"}`}>
              {formatPrice(price)}₺
            </span>
            {campaign && (
              <p className="mt-0.5 text-xs font-bold text-rose-600">
                {campaign.name} −%{campaign.percent}
              </p>
            )}
            <p className="text-xs text-slate-400">KDV dahil</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-500">{pkg.description}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <ClockIcon /> {pkg.deliveryDays} gün teslim
          </span>
          <span className="flex items-center gap-1">
            <RefreshIcon /> {pkg.revisionCount} revizyon
          </span>
        </div>

        {pkg.features.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {pkg.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckIcon /> {f}
              </li>
            ))}
          </ul>
        )}

        {isOwnGig ? (
          <p className="mt-5 rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-500">
            Bu senin ilanın
          </p>
        ) : !acceptingOrders ? (
          <div className="mt-5">
            <p className="rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-500">
              Şu An Sipariş Almıyor
            </p>
            <p className="mt-2 text-center text-xs text-slate-400">
              Bu satıcı yeni sipariş kabul etmiyor. Aşağıda benzer hizmetleri bulabilirsin.
            </p>
          </div>
        ) : (
          <form action={orderAction}>
            {firstOrderOffer && (
              <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                İlk siparişine özel %{firstOrderOffer.percent.toLocaleString("tr-TR")} indirim
                {price * (firstOrderOffer.percent / 100) > firstOrderOffer.maxTl
                  ? ` (en fazla ${formatPrice(firstOrderOffer.maxTl)}₺)`
                  : ` — ${formatPrice(price - Math.round(price * firstOrderOffer.percent) / 100)}₺ ödersin`}
              </p>
            )}
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="packageId" value={pkg.id} />
            <button
              type="submit"
              className="brand-gradient mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Devam Et
            </button>
          </form>
        )}

        {messageHref && (
          <Link
            href={messageHref}
            className="mt-3 block w-full rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-brand-navy transition hover:bg-slate-50"
          >
            Satıcıya Mesaj Gönder
          </Link>
        )}

        <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
          <li className="flex items-start gap-2">
            <CheckIcon /> Prosinta güvencesiyle ödeme — iş onaylanmadan satıcıya aktarılmaz
          </li>
        </ul>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Devam ederek{" "}
          <Link href="/kullanim-sartlari" className="underline">
            kullanım koşullarını
          </Link>{" "}
          kabul etmiş olursun.
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5.5 15a7 7 0 0012.7 2M18.5 9A7 7 0 005.8 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
