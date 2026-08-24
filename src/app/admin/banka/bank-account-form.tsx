"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "./actions";

const initialState: FormState = {};

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";

export function AddBankAccountForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful add so the next account starts blank.
  useEffect(() => {
    if (state.saved) formRef.current?.reset();
  }, [state.saved]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="accountHolder" className="mb-1 block text-xs font-medium text-slate-500">
          Hesap Sahibi
        </label>
        <input
          id="accountHolder"
          name="accountHolder"
          required
          defaultValue="Prosinta Dijital Teknolojiler A.Ş."
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
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div className="sm:col-span-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Ekleniyor..." : "Hesap Ekle"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.saved && !state.error && (
          <p className="text-sm text-emerald-600">Eklendi — ödeme sayfasında görünüyor.</p>
        )}
        <span className="ml-auto text-xs text-slate-400">
          IBAN boşluklu ya da bitişik olabilir; kaydedilirken sadeleşir ve doğrulanır.
        </span>
      </div>
    </form>
  );
}
