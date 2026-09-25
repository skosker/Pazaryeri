"use client";

import { useActionState } from "react";
import { createRequestAction, type RequestFormState } from "../actions";

const input = "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";
const label = "flex flex-col gap-1.5 text-sm font-medium text-brand-navy";

export function RequestForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(createRequestAction, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className={label}>
        Başlık
        <input name="title" required minLength={10} maxLength={100} defaultValue={v.title} className={input} />
        <span className="text-xs font-normal text-slate-400">Ne yaptırmak istediğini tek cümlede yaz.</span>
      </label>
      <label className={label}>
        Kategori
        <select name="categoryId" required defaultValue={v.categoryId ?? ""} key={v.categoryId} className={input}>
          <option value="" disabled>
            Seç
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className={label}>
          En Düşük Bütçe (TL)
          <input name="budgetMin" type="number" min={100} required defaultValue={v.budgetMin} className={input} />
        </label>
        <label className={label}>
          En Yüksek Bütçe (TL)
          <input name="budgetMax" type="number" min={100} required defaultValue={v.budgetMax} className={input} />
        </label>
        <label className={label}>
          Teslim Süresi (gün)
          <input name="deliveryDays" type="number" min={1} max={365} required defaultValue={v.deliveryDays} className={input} />
        </label>
      </div>
      <label className={label}>
        Açıklama
        <textarea name="description" required minLength={30} maxLength={3000} rows={7} defaultValue={v.description} className={input} />
        <span className="text-xs font-normal text-slate-400">
          İşin kapsamını, beklentilerini ve varsa örnekleri anlat. Telefon, e-posta gibi iletişim bilgileri otomatik gizlenir;
          freelancer&apos;larla Prosinta mesajlarından konuşabilirsin.
        </span>
      </label>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient self-start rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Yayınlanıyor..." : "Talebi Yayınla"}
      </button>
    </form>
  );
}
