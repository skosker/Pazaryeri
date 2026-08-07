"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "./actions";

const initialState: FormState = {};

export function ProfileForm({
  isFreelancer,
  defaultValues,
}: {
  isFreelancer: boolean;
  defaultValues: { name: string; title: string; bio: string };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Ad Soyad
        <input
          name="name"
          required
          minLength={2}
          defaultValue={defaultValues.name}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      {isFreelancer && (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Unvan
            <input
              name="title"
              defaultValue={defaultValues.title}
              placeholder="ör. Grafik Tasarımcı"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Hakkımda
            <textarea
              name="bio"
              rows={4}
              defaultValue={defaultValues.bio}
              placeholder="Kendinden ve uzmanlığından kısaca bahset"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </label>
        </>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Profilin güncellendi.</p>
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
