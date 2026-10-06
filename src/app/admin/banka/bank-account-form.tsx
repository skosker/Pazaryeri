"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "./actions";

const initialState: FormState = {};

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";

type AccountValues = { accountHolder: string; bankName: string; iban: string; categoryId: string };
export type CategoryOption = { id: string; name: string };

/**
 * Holder, bank, IBAN and job category inputs; `idPrefix` keeps the label ids unique when
 * several forms are on the page.
 */
function AccountFields({
  idPrefix,
  values,
  categories,
}: {
  idPrefix: string;
  values?: AccountValues;
  categories: CategoryOption[];
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-accountHolder`} className="mb-1 block text-xs font-medium text-slate-500">
          Hesap Sahibi
        </label>
        <input
          id={`${idPrefix}-accountHolder`}
          name="accountHolder"
          required
          defaultValue={values?.accountHolder ?? "Prosinta Dijital Teknolojiler A.Ş."}
          placeholder="Prosinta Dijital Teknolojiler A.Ş."
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-bankName`} className="mb-1 block text-xs font-medium text-slate-500">
          Banka
        </label>
        <input
          id={`${idPrefix}-bankName`}
          name="bankName"
          required
          defaultValue={values?.bankName}
          placeholder="Garanti Bankası"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-iban`} className="mb-1 block text-xs font-medium text-slate-500">
          IBAN
        </label>
        <input
          id={`${idPrefix}-iban`}
          name="iban"
          required
          defaultValue={values?.iban}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-categoryId`} className="mb-1 block text-xs font-medium text-slate-500">
          Kategori
        </label>
        <select
          id={`${idPrefix}-categoryId`}
          name="categoryId"
          defaultValue={values?.categoryId ?? ""}
          className={`${fieldClass} bg-white`}
        >
          <option value="">Genel (tüm ödemeler)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function AddBankAccountForm({
  action,
  categories,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: CategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful add so the next account starts blank.
  useEffect(() => {
    if (state.saved) formRef.current?.reset();
  }, [state.saved]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AccountFields idPrefix="new" categories={categories} />

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
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

/** "Düzenle" on a listed account: opens its details in a dialog and saves the changes in place. */
export function EditBankAccountButton({
  id,
  values,
  categories,
  action,
}: {
  id: string;
  values: AccountValues;
  categories: CategoryOption[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close once saved; the list behind it is already refreshed by the action.
  useEffect(() => {
    if (state.saved) dialogRef.current?.close();
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300"
      >
        Düzenle
      </button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/40"
      >
        <form action={formAction} className="space-y-4 p-6">
          <p className="text-sm font-semibold text-brand-navy">Hesabı Düzenle</p>
          <AccountFields
            idPrefix={`edit-${id}`}
            values={state.error && state.values ? state.values : values}
            categories={categories}
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={pending}
              className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
