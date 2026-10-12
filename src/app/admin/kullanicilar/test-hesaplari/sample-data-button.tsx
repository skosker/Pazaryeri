"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createSampleDataAction, type SampleDataState } from "./actions";

/** One press: example memberships and orders for every test account. */
export function SampleDataButton() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<SampleDataState>({});
  const d = state.done;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-navy">Örnek Üyelik ve Sipariş</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Her test hesabına sırayla ödenmiş Pro Plus (aylık), ödenmiş Pro (yıllık) ya da onay bekleyen Pro Plus havalesi;
            ayrıca vitrin ilanlarından biri onay bekleyen, biri ödenmiş iki sipariş açılır. Zaten üyelik ödemesi ve siparişi olan
            hesap atlanır. Test hesapları gelir raporuna girmez.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Tüm test hesapları için örnek üyelik ödemeleri ve siparişler oluşturulsun mu?")) return;
            startTransition(async () => setState(await createSampleDataAction()));
          }}
          className="brand-gradient ml-auto rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Oluşturuluyor..." : "Örnek Üyelik ve Sipariş Oluştur"}
        </button>
      </div>
      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {d && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">
            {d.accounts - d.skipped} hesap için oluşturuldu{d.skipped ? ` · ${d.skipped} hesap zaten hazırdı` : ""}
          </p>
          <ul className="mt-1 space-y-0.5 text-xs">
            <li>{d.paidMemberships} ödenmiş üyelik → <Link href="/admin/faturalar?tur=uyelik" className="font-semibold underline">Faturalar</Link> (kesilecek)</li>
            <li>{d.pendingMemberships} onay bekleyen üyelik havalesi ve {d.pendingOrders} onay bekleyen sipariş → <Link href="/admin/havale-onaylari" className="font-semibold underline">Havale/EFT Onayları</Link></li>
            <li>{d.paidOrders} ödenmiş sipariş → <Link href="/admin/siparisler" className="font-semibold underline">Siparişler</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}
