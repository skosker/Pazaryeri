"use client";

import { useActionState } from "react";
import { saveOfferAction, type OfferFormState } from "../actions";

const input = "rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";

export function OfferForm({
  requestId,
  gigs,
  existing,
  quotaNote,
}: {
  requestId: string;
  gigs: { id: string; title: string }[];
  existing: { gigId: string; price: number; deliveryDays: number; message: string } | null;
  quotaNote: string;
}) {
  const [state, action, pending] = useActionState<OfferFormState, FormData>(saveOfferAction.bind(null, requestId), {});
  const v = state.values ?? (existing
    ? { gigId: existing.gigId, price: String(existing.price), deliveryDays: String(existing.deliveryDays), message: existing.message }
    : {});

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
        Teklif Verdiğin İlan
        <select name="gigId" required defaultValue={v.gigId ?? gigs[0]?.id} key={v.gigId} className={input}>
          {gigs.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-slate-400">Alıcı teklifini bu ilanın yorumları ve örnek işleriyle birlikte görür.</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
          Fiyat (TL)
          <input name="price" type="number" min={100} step="1" required defaultValue={v.price} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
          Teslim Süresi (gün)
          <input name="deliveryDays" type="number" min={1} max={365} required defaultValue={v.deliveryDays} className={input} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-navy">
        Ön Yazı
        <textarea name="message" required minLength={20} maxLength={1500} rows={5} defaultValue={v.message} className={input} />
        <span className="text-xs font-normal text-slate-400">
          İşi nasıl yapacağını, benzer tecrübelerini anlat. İletişim bilgileri otomatik gizlenir.
        </span>
      </label>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state.saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Teklifin gönderildi.</p>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">{quotaNote}</span>
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Gönderiliyor..." : existing ? "Teklifi Güncelle" : "Teklif Ver"}
        </button>
      </div>
    </form>
  );
}
