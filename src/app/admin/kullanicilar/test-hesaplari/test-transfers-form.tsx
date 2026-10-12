"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createTestTransfersAction, type TestTransfersState } from "./actions";

const select = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400";

/** Pick test accounts and a plan; each gets a pending Havale/EFT notice to approve. */
export function TestTransfersForm({ accounts }: { accounts: { id: string; name: string; waiting: boolean }[] }) {
  const [state, action, pending] = useActionState<TestTransfersState, FormData>(createTestTransfersAction, {});
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const selectable = accounts.filter((a) => !a.waiting);
  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-brand-navy">Test Havale Bildirimi</p>
      <p className="mt-1 text-xs text-slate-500">
        Seçilen her hesap için Havale/EFT Onayları&apos;na bekleyen bir üyelik bildirimi düşer; tutar bugünkü fiyattır.
        Alıcı olan hesaplar Freelancer yapılır. Zaten bekleyen bildirimi olan hesap seçilemez.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select name="plan" defaultValue="PRO" aria-label="Paket" className={select}>
          <option value="PRO">Pro</option>
          <option value="PRO_PLUS">Pro Plus</option>
        </select>
        <select name="period" defaultValue="aylik" aria-label="Süre" className={select}>
          <option value="aylik">Aylık</option>
          <option value="yillik">Yıllık</option>
        </select>
        <button
          type="button"
          onClick={() => setChosen(chosen.size === selectable.length ? new Set() : new Set(selectable.map((a) => a.id)))}
          className="text-sm font-semibold text-purple-700 hover:underline"
        >
          {chosen.size === selectable.length && selectable.length > 0 ? "Seçimi Kaldır" : "Tümünü Seç"}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((a) => (
          <label
            key={a.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              a.waiting ? "border-slate-100 text-slate-400" : "cursor-pointer border-slate-200 text-brand-navy has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50"
            }`}
          >
            <input
              type="checkbox"
              name="userId"
              value={a.id}
              disabled={a.waiting}
              checked={chosen.has(a.id)}
              onChange={() => toggle(a.id)}
              className="accent-purple-600"
            />
            {a.name}
            {a.waiting && <span className="ml-auto text-[11px]">bekliyor</span>}
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || chosen.size === 0}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Oluşturuluyor..." : `Bildirim Oluştur (${chosen.size})`}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.created !== undefined && !state.error && (
          <p className="text-sm text-emerald-700">
            {state.created} bildirim oluşturuldu
            {state.skipped && state.skipped.length > 0 ? ` · atlanan: ${state.skipped.join(", ")}` : ""} ·{" "}
            <Link href="/admin/havale-onaylari" className="font-semibold underline">Havale/EFT Onayları&apos;na git</Link>
          </p>
        )}
      </div>
    </form>
  );
}
