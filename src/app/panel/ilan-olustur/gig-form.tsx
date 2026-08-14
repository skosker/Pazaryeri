"use client";

import { useActionState } from "react";
import { CoverImageField } from "@/components/cover-image-field";
import type { FormState } from "./actions";

const initialState: FormState = {};

export type TierValues = {
  price?: number;
  deliveryDays?: number;
  revisionCount?: number;
  description?: string;
};

type GigFormValues = {
  title?: string;
  categoryId?: string;
  description?: string;
  coverImage?: string | null;
  basic?: TierValues;
  standard?: TierValues;
  premium?: TierValues;
};

const tiers = [
  {
    key: "basic",
    label: "Temel Paket",
    hint: "Sade kapsam, uygun fiyat.",
    placeholder: "Tek konsept, temel teslimat.",
  },
  {
    key: "standard",
    label: "Standart Paket",
    hint: "En çok tercih edilen paket.",
    placeholder: "Kaynak dosyalar ve revizyon hakkı dahil.",
  },
  {
    key: "premium",
    label: "Premium Paket",
    hint: "Geniş kapsam, öncelikli teslimat.",
    placeholder: "Tüm kaynak dosyalar, ek revizyon ve öncelikli teslimat dahil.",
  },
] as const;

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

      <CoverImageField currentUrl={defaultValues?.coverImage} />

      <div>
        <h3 className="font-semibold text-brand-navy">Paketler</h3>
        <p className="mt-1 text-sm text-slate-500">
          Alıcılar bu üç paketten birini seçerek sipariş verir. Fiyatlar Temel&apos;den
          Premium&apos;a doğru artmalı.
        </p>
      </div>

      {tiers.map((tier) => {
        const values = defaultValues?.[tier.key];
        return (
          <div key={tier.key} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-baseline gap-2">
              <h4 className="font-semibold text-brand-navy">{tier.label}</h4>
              <span className="text-xs text-slate-400">{tier.hint}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
                Fiyat (₺)
                <input
                  name={`${tier.key}Price`}
                  type="number"
                  min={1}
                  step="1"
                  required
                  defaultValue={values?.price}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
                Teslim (gün)
                <input
                  name={`${tier.key}DeliveryDays`}
                  type="number"
                  min={1}
                  step="1"
                  required
                  defaultValue={values?.deliveryDays}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
                Revizyon
                <input
                  name={`${tier.key}RevisionCount`}
                  type="number"
                  min={0}
                  step="1"
                  required
                  defaultValue={values?.revisionCount ?? 2}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
              Paket açıklaması
              <textarea
                name={`${tier.key}Description`}
                required
                minLength={10}
                rows={2}
                defaultValue={values?.description}
                placeholder={tier.placeholder}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
              />
            </label>
          </div>
        );
      })}

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
