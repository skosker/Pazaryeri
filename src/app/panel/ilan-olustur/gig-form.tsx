"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

const initialState: FormState = {};

type GigFormValues = {
  title?: string;
  categoryId?: string;
  description?: string;
  price?: number;
  deliveryDays?: number;
  revisionCount?: number;
  packageDescription?: string;
};

export function GigForm({
  categories,
  action,
  defaultValues,
  submitLabel = "İlanı Yayınla",
  pendingLabel = "Yayınlanıyor...",
}: {
  categories: { id: string; name: string }[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: GigFormValues;
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Başlık
        <input
          name="title"
          required
          minLength={10}
          defaultValue={defaultValues?.title}
          placeholder="ör. Sosyal medya içerik tasarımı yapıyorum"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Kategori
        <select
          name="categoryId"
          required
          defaultValue={defaultValues?.categoryId ?? ""}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        >
          <option value="">Kategori seç</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Açıklama
        <textarea
          name="description"
          required
          minLength={30}
          rows={5}
          defaultValue={defaultValues?.description}
          placeholder="Hizmetini detaylıca anlat"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="mb-3 font-semibold text-brand-navy">Standart Paket</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Fiyat (₺)
            <input
              name="price"
              type="number"
              min={1}
              step="1"
              required
              defaultValue={defaultValues?.price}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Teslim (gün)
            <input
              name="deliveryDays"
              type="number"
              min={1}
              step="1"
              required
              defaultValue={defaultValues?.deliveryDays}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Revizyon
            <input
              name="revisionCount"
              type="number"
              min={0}
              step="1"
              defaultValue={defaultValues?.revisionCount ?? 2}
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
          Paket açıklaması
          <textarea
            name="packageDescription"
            required
            minLength={10}
            rows={2}
            defaultValue={defaultValues?.packageDescription}
            placeholder="Temel içerik paketi, 2 revizyon ve kaynak dosyalar dahil."
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </label>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient self-start rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
