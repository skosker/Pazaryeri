"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format-price";

export type PlanPeriodPrice = {
  /** Charged for the whole period (campaign discount included). */
  total: number;
  /** What the card shows per month. */
  perMonth: number;
  /** Struck through next to perMonth when lower than it (monthly list price, or pre-campaign). */
  listPerMonth: number;
};

export type PlanFeature = { strong?: string; text: string };

export type PlanCardData = {
  key: "FREE" | "PRO" | "PRO_PLUS";
  name: string;
  tagline: string;
  /** Null for the free plan. */
  prices: { aylik: PlanPeriodPrice; yillik: PlanPeriodPrice } | null;
  features: PlanFeature[];
  highlight?: boolean;
  /** `{donem}` in href is replaced with the chosen period. No href: shown disabled. */
  cta: { label: string; href?: string };
  /** Free trial button (Pro): a form action for an eligible freelancer, or a link. */
  trial?: { label: string; action?: () => Promise<void>; href?: string };
  badge?: string;
};

export function MembershipPlans({
  plans,
  yearlyDiscountPercent,
  campaignNote,
}: {
  plans: PlanCardData[];
  yearlyDiscountPercent: number;
  /** e.g. "Freelancer Günü'ne özel %50 indirim fiyatlara yansıtıldı". */
  campaignNote?: string | null;
}) {
  const [period, setPeriod] = useState<"aylik" | "yillik">("aylik");

  return (
    <div>
      <div className="mx-auto flex w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {(["aylik", "yillik"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              period === p ? "brand-gradient text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p === "aylik" ? "Aylık Plan" : "Yıllık Plan"}
            {p === "yillik" && yearlyDiscountPercent > 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  period === p ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                %{yearlyDiscountPercent.toLocaleString("tr-TR")} Tasarruf
              </span>
            )}
          </button>
        ))}
      </div>

      {campaignNote && <p className="mt-3 text-center text-sm font-semibold text-rose-600">{campaignNote}</p>}

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
        {plans.map((plan) => {
          const price = plan.prices?.[period] ?? null;
          const discounted = price !== null && price.listPerMonth > price.perMonth;
          return (
            <section
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                plan.highlight ? "border-purple-300 shadow-lg shadow-purple-100 md:-mt-4 md:pb-10" : "border-slate-200"
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${plan.highlight ? "brand-gradient" : "bg-slate-200"}`} />
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-brand-navy">{plan.name}</h2>
                {plan.badge && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

              <div className="mt-5 min-h-[5.5rem]">
                {price === null ? (
                  <p className="pt-2 text-sm leading-relaxed text-slate-600">
                    Süre sınırı yok, kart bilgisi gerekmez. Hemen ilan açıp satışa başla.
                  </p>
                ) : (
                  <>
                    <p className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${discounted ? "text-rose-600" : "text-brand-navy"}`}>
                        {formatPrice(price.perMonth)}₺
                      </span>
                      <span className="text-sm text-slate-500">/ ay</span>
                    </p>
                    {discounted && (
                      <p className="mt-0.5 text-sm text-slate-400 line-through">{formatPrice(price.listPerMonth)}₺ / ay</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {period === "yillik"
                        ? `Yıllık ${formatPrice(price.total)}₺ tek ödeme`
                        : "Aylık ödeme, otomatik yenilenmez"}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 space-y-2">
                {plan.cta.href ? (
                  <Link
                    href={plan.cta.href.replace("{donem}", period)}
                    className="brand-gradient block rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
                  >
                    {plan.cta.label}
                  </Link>
                ) : (
                  <span className="block rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-400">
                    {plan.cta.label}
                  </span>
                )}
                {plan.trial &&
                  (plan.trial.action ? (
                    <form action={plan.trial.action}>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                      >
                        {plan.trial.label}
                      </button>
                    </form>
                  ) : plan.trial.href ? (
                    <Link
                      href={plan.trial.href}
                      className="block rounded-full bg-emerald-500 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      {plan.trial.label}
                    </Link>
                  ) : null)}
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    <span>
                      {feature.strong && <strong className="font-semibold text-brand-navy">{feature.strong} </strong>}
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
