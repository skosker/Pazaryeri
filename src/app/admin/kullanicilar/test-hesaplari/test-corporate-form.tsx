"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createTestCorporateAction, type TestCorporateState } from "./actions";

const select = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400";

/** Pick test accounts; each becomes a buyer with a test company and gets a Kurumsal package. */
export function TestCorporateForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<TestCorporateState, FormData>(createTestCorporateAction, {});
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-brand-navy">Alıcılar İçin Kurumsal Paket</p>
      <p className="mt-1 text-xs text-slate-500">
        Seçilen hesaplar Alıcı yapılır, test şirket bilgisi eklenir ve Kurumsal / Kurumsal Plus paketi ödenmiş ya da havale onayı
        bekliyor olarak tanımlanır. Zaten kurumsal paketi olan hesap atlanır.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select name="plan" defaultValue="KURUMSAL" aria-label="Paket" className={select}>
          <option value="KURUMSAL">Kurumsal</option>
          <option value="KURUMSAL_PLUS">Kurumsal Plus</option>
        </select>
        <select name="period" defaultValue="aylik" aria-label="Süre" className={select}>
          <option value="aylik">Aylık</option>
          <option value="yillik">Yıllık</option>
        </select>
        <select name="state" defaultValue="paid" aria-label="Durum" className={select}>
          <option value="paid">Ödenmiş (paket açılır)</option>
          <option value="pending">Havale onayı bekliyor</option>
        </select>
        <button
          type="button"
          onClick={() => setChosen(chosen.size === accounts.length ? new Set() : new Set(accounts.map((a) => a.id)))}
          className="text-sm font-semibold text-purple-700 hover:underline"
        >
          {chosen.size === accounts.length && accounts.length > 0 ? "Seçimi Kaldır" : "Tümünü Seç"}
        </button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((a) => (
          <label
            key={a.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-navy has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50"
          >
            <input type="checkbox" name="userId" value={a.id} checked={chosen.has(a.id)} onChange={() => toggle(a.id)} className="accent-purple-600" />
            {a.name}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || chosen.size === 0}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Oluşturuluyor..." : `Kurumsal Paket Oluştur (${chosen.size})`}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.created !== undefined && !state.error && (
          <p className="text-sm text-emerald-700">
            {state.created} paket oluşturuldu{state.skipped?.length ? ` · atlanan: ${state.skipped.join(", ")}` : ""} ·{" "}
            <Link href="/admin/faturalar?tur=uyelik" className="font-semibold underline">Faturalar</Link> ·{" "}
            <Link href="/admin/havale-onaylari" className="font-semibold underline">Havale/EFT Onayları</Link>
          </p>
        )}
        {state.plansClosed && (
          <p className="w-full text-xs text-amber-700">
            Kurumsal paketler Admin → Üyelik ve Gelir Ayarları&apos;nda kapalı; paketler kaydedildi ama üyelerin panelinde
            görünmez. Açmak için Kurumsal ayarlarını etkinleştir.
          </p>
        )}
      </div>
    </form>
  );
}
