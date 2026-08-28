"use client";

import { useActionState, useRef } from "react";
import { importBankTransfersAction, type ImportResult } from "./import-actions";

const initialState: ImportResult = {};

export function ImportTransfersForm() {
  const [state, formAction, pending] = useActionState(importBankTransfersAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-brand-navy">Excel ile Toplu Ekle</p>
      <p className="mt-1 text-xs text-slate-500">
        Sütunlar: <span className="font-medium">Alıcı Adı, Tutar</span> — Tarih ve Durum
        (&quot;Onaylandı&quot; / boş) sütunları opsiyonel. Alıcı adı sistemde varsa o
        hesaba, yoksa yeni bir alıcı hesabına bağlanır.
      </p>

      <form
        ref={formRef}
        action={(formData) => {
          formAction(formData);
          formRef.current?.reset();
        }}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        <input
          type="file"
          name="dosya"
          accept=".xlsx"
          required
          className="text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
        />
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Yükleniyor..." : "Yükle"}
        </button>
      </form>

      {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}

      {state.added !== undefined && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-emerald-600">{state.added} sipariş oluşturuldu.</p>
          {state.failed && state.failed.length > 0 && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <p className="font-semibold">{state.failed.length} satır atlandı:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {state.failed.slice(0, 10).map((f, i) => (
                  <li key={i}>
                    Satır {f.row}: {f.reason}
                  </li>
                ))}
              </ul>
              {state.failed.length > 10 && (
                <p className="mt-1">+{state.failed.length - 10} satır daha</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
