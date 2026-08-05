"use client";

import { useActionState, useState } from "react";
import { registerAction, type FormState } from "./actions";

const initialState: FormState = {};

export function RegisterForm({ defaultRole }: { defaultRole: "BUYER" | "FREELANCER" }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [role, setRole] = useState<"BUYER" | "FREELANCER">(defaultRole);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setRole("BUYER")}
          className={`rounded-full py-2 transition ${
            role === "BUYER" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
          }`}
        >
          Alıcıyım
        </button>
        <button
          type="button"
          onClick={() => setRole("FREELANCER")}
          className={`rounded-full py-2 transition ${
            role === "FREELANCER" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
          }`}
        >
          Freelancer&apos;ım
        </button>
      </div>
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
