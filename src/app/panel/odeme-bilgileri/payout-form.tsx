"use client";

import { useActionState } from "react";
import { updatePayoutDetailsAction, type FormState } from "./actions";

const initialState: FormState = {};

const fieldClass =
  "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

export function PayoutForm({
  iban,
  ibanHolder,
}: {
  iban: string | null;
  ibanHolder: string | null;
}) {
  const [state, formAction, pending] = useActionState(updatePayoutDetailsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        IBAN
        <input
          name="iban"
          defaultValue={iban ?? ""}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className={`${fieldClass} font-mono`}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Hesap sahibi
        <input
          name="ibanHolder"
          defaultValue={ibanHolder ?? ""}
          placeholder="Hesabın açık olduğu ad soyad"
          className={fieldClass}
        />
        <span className="text-xs font-normal text-slate-400">
          Bankada hesabın kayıtlı olduğu isimle birebir aynı olmalı; farklıysa havale geri döner.
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Ödeme bilgilerin kaydedildi.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient self-start rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
