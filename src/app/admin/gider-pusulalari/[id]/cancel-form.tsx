"use client";

import { useActionState } from "react";
import type { FormState } from "../actions";

/** "İptal Et" with a required reason; the sıra no stays used. */
export function CancelVoucherForm({ action }: { action: (state: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <details className="group">
      <summary className="cursor-pointer list-none rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
        İptal Et
      </summary>
      <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          name="reason"
          required
          placeholder="İptal gerekçesi (örn. tutar hatalı girildi)"
          className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-300"
        />
        <button
          disabled={pending}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "İptal ediliyor..." : "İptali Onayla"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </details>
  );
}
