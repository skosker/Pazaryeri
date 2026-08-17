"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "./actions";

const initialState: FormState = {};

export function RegisterForm({ role }: { role: "BUYER" | "FREELANCER" }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Chosen on the previous step; the account is created with this role. Either
          side can still switch later from the panel. */}
      <input type="hidden" name="role" value={role} />

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Ad Soyad
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Adın Soyadın"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

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

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Şifre
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
}
