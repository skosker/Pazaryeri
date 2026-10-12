"use client";

import { useActionState } from "react";
import type { PdfFormState } from "./actions";

/** "PDF Yükle" for an invoice already marked as cut. */
export function InvoicePdfForm({ action }: { action: (state: PdfFormState, formData: FormData) => Promise<PdfFormState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <input
        type="file"
        name="pdf"
        accept="application/pdf"
        required
        aria-label="e-Arşiv fatura PDF'i"
        className="w-44 text-[11px] text-slate-500 file:mr-1.5 file:rounded-full file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-slate-600"
      />
      <button
        disabled={pending}
        className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "Yükleniyor..." : "PDF Yükle"}
      </button>
      {state.error && <span className="text-[11px] text-red-600">{state.error}</span>}
    </form>
  );
}
