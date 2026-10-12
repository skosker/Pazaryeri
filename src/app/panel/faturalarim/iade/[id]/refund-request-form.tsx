"use client";

import { useActionState } from "react";
import type { RefundRequestState } from "../../actions";
import { REFUND_REASONS } from "@/lib/refund-labels";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";
const label = "mb-1 block text-xs font-medium text-slate-500";

export function RefundRequestForm({
  action,
  askIban,
  defaults,
}: {
  action: (state: RefundRequestState, formData: FormData) => Promise<RefundRequestState>;
  askIban: boolean;
  defaults: { iban: string; ibanHolder: string };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  // React resets the form after the action; a rejected try comes back with what was typed.
  const v = state.values ?? { reason: "", note: "", ...defaults };

  return (
    <form action={formAction} key={JSON.stringify(v)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <fieldset>
        <legend className={label}>İade Gerekçesi</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {Object.entries(REFUND_REASONS).map(([key, text]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-brand-navy has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50"
            >
              <input type="radio" name="reason" value={key} defaultChecked={v.reason === key} required className="accent-purple-600" />
              {text}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="note" className={label}>Açıklama</label>
        <textarea
          id="note"
          name="note"
          rows={4}
          required
          minLength={10}
          maxLength={1000}
          defaultValue={v.note}
          placeholder="Örn. Aynı paketi iki kez ödedim; ikinci ödemenin iadesini istiyorum."
          className={field}
        />
      </div>

      {askIban && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="iban" className={label}>İadenin Gönderileceği IBAN</label>
            <input id="iban" name="iban" required defaultValue={v.iban} placeholder="TR00 0000 0000 0000 0000 0000 00" className={`${field} font-mono`} />
          </div>
          <div>
            <label htmlFor="ibanHolder" className={label}>Hesap Sahibi</label>
            <input id="ibanHolder" name="ibanHolder" required defaultValue={v.ibanHolder} className={field} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Gönderiliyor..." : "İade Talebini Gönder"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
