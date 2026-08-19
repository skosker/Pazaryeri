"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

const field =
  "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-500">
          ✓
        </div>
        <p className="mt-3 font-semibold text-brand-navy">Şifren güncellendi</p>
        <p className="mt-1 text-sm text-slate-500">Artık yeni şifrenle giriş yapabilirsin.</p>
        <Link
          href="/giris"
          className="brand-gradient mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yeni şifre
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
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

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
