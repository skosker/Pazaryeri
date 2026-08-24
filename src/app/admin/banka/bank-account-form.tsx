"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";
import type { BankTransferInfo } from "@/lib/bank-transfer";

const initialState: FormState = {};

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";

export function BankAccountForm({
  action,
  current,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  current: BankTransferInfo;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="accountHolder" className="mb-1 block text-xs font-medium text-slate-500">
          Hesap Sahibi
        </label>
        <input
          id="accountHolder"
          name="accountHolder"
          required
          defaultValue={current.accountHolder}
          placeholder="Prosinta Dijital Teknolojiler A.Ş."
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="bankName" className="mb-1 block text-xs font-medium text-slate-500">
          Banka
        </label>
        <input
          id="bankName"
          name="bankName"
          required
          defaultValue={current.bankName}
          placeholder="Garanti Bankası"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="iban" className="mb-1 block text-xs font-medium text-slate-500">
          IBAN
        </label>
        <input
          id="iban"
          name="iban"
          required
          defaultValue={current.iban}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className={`${fieldClass} font-mono`}
        />
        <p className="mt-1 text-xs text-slate-400">
          Boşluklu ya da bitişik yazabilirsin; kaydedilirken boşlukları temizlenir ve
          kontrol haneleri doğrulanır.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.saved && !state.error && (
          <p className="text-sm text-emerald-600">Kaydedildi — ödeme sayfasında görünüyor.</p>
        )}
      </div>
    </form>
  );
}
