"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.sent) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        <p className="font-semibold">E-postanı kontrol et.</p>
        <p className="mt-1">
          Bu adrese kayıtlı bir hesap varsa şifre sıfırlama bağlantısını gönderdik.
          Bağlantı 1 saat geçerli. Gelen kutunda yoksa spam klasörüne de bak.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        E-posta
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@eposta.com"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
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
        {pending ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </button>
    </form>
  );
}
