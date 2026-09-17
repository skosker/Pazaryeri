"use client";

import { useActionState, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { updateProfileAction, type FormState } from "./actions";

const initialState: FormState = {};

export function ProfileForm({
  isFreelancer,
  defaultValues,
  image,
  pending: pendingReview,
}: {
  isFreelancer: boolean;
  defaultValues: { name: string; title: string; bio: string };
  image: string | null;
  pending: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <UserAvatar name={defaultValues.name} image={preview ?? image} className="h-16 w-16 text-xl" />
        <label className="flex cursor-pointer flex-col gap-1 text-sm font-medium text-brand-navy">
          Profil Fotoğrafı
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
          />
        </label>
      </div>

      {pendingReview && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Yeni fotoğrafın incelemede — admin onayladıktan sonra profilinde görünecek.
        </p>
      )}

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
      {state.success && state.flagged && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Bilgilerin kaydedildi. Yeni fotoğrafın incelemeye alındı, onaylanınca profilinde görünecek.
        </p>
      )}
      {state.success && !state.flagged && (
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
