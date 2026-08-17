"use client";

import { useActionState } from "react";
import { markPayoutPaidAction, type PayoutFormState } from "@/lib/payout-actions";

const initialState: PayoutFormState = {};

export function MarkPaidForm({ payoutId, disabled }: { payoutId: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState(markPayoutPaidAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="payoutId" value={payoutId} />
      <input
        name="note"
        placeholder="Dekont no (opsiyonel)"
        className="w-40 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
      />
      <button
        type="submit"
        disabled={pending || disabled}
        title={disabled ? "Satıcının IBAN'ı kayıtlı değil" : undefined}
        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "İşleniyor..." : "Ödendi İşaretle"}
      </button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
