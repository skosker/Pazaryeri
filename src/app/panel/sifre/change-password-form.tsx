"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

const field =
  "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Mevcut şifren
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yeni şifre
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yeni şifre (tekrar)
        <input
          name="passwordAgain"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
          className={field}
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      {state.done && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Şifren güncellendi. Bir dahaki girişinde yeni şifreni kullan.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-2 w-fit rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Şifreyi Değiştir"}
      </button>
    </form>
  );
}
