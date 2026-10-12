"use client";

import { useActionState, useState } from "react";
import { setTestPricesAction, type TestPricesState } from "./actions";
import { formatPrice } from "@/lib/format-price";

const field = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400";

/** Reprice a few showcase gigs to given amounts and list their links for test orders. */
export function TestPricesForm() {
  const [state, action, pending] = useActionState<TestPricesState, FormData>(setTestPricesAction, {});
  const [prices, setPrices] = useState("2000 3000 78000");
  const [count, setCount] = useState("5");
  const [copied, setCopied] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const allLinks = (state.groups ?? [])
    .flatMap((g) => [`${formatPrice(g.price)} TL`, ...g.gigs.map((x) => `${x.title}\t${origin}/gig/${x.slug}`), ""])
    .join("\n");

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-brand-navy">Test Fiyatlı İlanlar</p>
      <p className="mt-1 text-xs text-slate-500">
        Vitrin (üretilmiş) ilanlardan seçilenlerin başlangıç fiyatını girdiğin tutara ayarlar; diğer paketler oranını korur.
        Gerçek freelancer ilanlarına dokunmaz. Test hesapları bu ilanlardan sipariş verebilir.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="prices" className="mb-1 block text-xs font-medium text-slate-500">Fiyatlar (TL, boşlukla ayır)</label>
          <input id="prices" name="prices" value={prices} onChange={(e) => setPrices(e.target.value)} className={`${field} w-56 font-mono`} />
        </div>
        <div>
          <label htmlFor="count" className="mb-1 block text-xs font-medium text-slate-500">Her fiyattan</label>
          <select id="count" name="count" value={count} onChange={(e) => setCount(e.target.value)} className={field}>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>{n} ilan</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Güncelleniyor..." : "Fiyatları Ayarla ve Linkleri Ver"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>

      {state.groups && (
        <div className="mt-5 space-y-4">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(allLinks);
              setCopied(true);
            }}
            className="rounded-full border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
          >
            {copied ? "Kopyalandı ✓" : "Tüm Linkleri Kopyala"}
          </button>
          {state.groups.map((g) => (
            <div key={g.price}>
              <p className="text-sm font-semibold text-brand-navy">
                {formatPrice(g.price)} TL <span className="font-normal text-slate-400">· {g.gigs.length} ilan</span>
              </p>
              <ul className="mt-1.5 space-y-1 text-sm">
                {g.gigs.map((x) => (
                  <li key={x.slug} className="flex flex-wrap items-baseline gap-2">
                    <a href={`/gig/${x.slug}`} target="_blank" className="font-medium text-purple-700 hover:underline">
                      {x.title}
                    </a>
                    <span className="font-mono text-[11px] text-slate-400">{origin}/gig/{x.slug}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
