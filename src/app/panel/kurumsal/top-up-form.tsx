"use client";

import { useActionState } from "react";
import { requestTopUpAction, type TopUpState } from "./actions";

const initialState: TopUpState = {};

export function TopUpForm({ minTopUp }: { minTopUp: number }) {
  const [state, formAction, pending] = useActionState(requestTopUpAction, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yüklenen tutar (TL)
        <input
          name="amount"
          type="number"
          min={minTopUp}
          step="0.01"
          required
          placeholder={String(minTopUp)}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor..." : "Ödeme Bildirimi Yap"}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>}
      {state.success && !pending && (
        <p className="text-sm text-emerald-700 sm:basis-full">
          Bildirimin alındı; ödemen onaylanınca bakiyene eklenecek.
        </p>
      )}
    </form>
  );
}
