"use client";

import { useActionState, useState } from "react";
import { updateCompanyAction, type CompanyFormState } from "./actions";

const initialState: CompanyFormState = {};
const inputClass =
  "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

export type CompanyValues = {
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  billingAddress: string;
};

export function CompanyForm({ values }: { values: CompanyValues | null }) {
  const [state, formAction, pending] = useActionState(updateCompanyAction, initialState);
  const [corporate, setCorporate] = useState(values !== null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="accountType" value={corporate ? "KURUMSAL" : "BIREYSEL"} />
      <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {[
          { value: false, label: "Bireysel" },
          { value: true, label: "Kurumsal" },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setCorporate(option.value)}
            className={`rounded-full py-2 transition ${
              corporate === option.value ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {corporate ? (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Şirket Unvanı
            <input name="companyName" required defaultValue={values?.companyName} className={inputClass} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
              Vergi Dairesi
              <input name="taxOffice" required defaultValue={values?.taxOffice} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
              Vergi Numarası
              <input
                name="taxNumber"
                required
                inputMode="numeric"
                pattern="[0-9 ]{10,13}"
                placeholder="10 haneli VKN"
                defaultValue={values?.taxNumber}
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Fatura Adresi
            <textarea name="billingAddress" required rows={2} defaultValue={values?.billingAddress} className={inputClass} />
          </label>
        </>
      ) : (
        <p className="text-sm text-slate-500">Faturaların adına ve e-posta adresine düzenlenir.</p>
      )}

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state.success && !pending && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Fatura bilgilerin kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient w-fit rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
