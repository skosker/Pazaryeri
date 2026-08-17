"use client";

import { useActionState, useState } from "react";
import { loginAction, type FormState } from "./actions";

const initialState: FormState = {};

// Showcase accounts only. The admin account is deliberately absent: publishing a
// credential that can suspend users or release escrow is not a demo feature.
const demoAccounts = [
  { label: "Alıcı", email: "buyer@profestia.dev" },
  { label: "Satıcı", email: "mert@profestia.dev" },
];
const demoPassword = "password123";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }

  return (
    <>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
          E-posta
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
          Şifre
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        <p className="mb-2 font-semibold text-slate-600">
          Demo hesap ile doldur (şifre: {demoPassword})
        </p>
        <div className="flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-purple-300 hover:text-purple-700"
            >
              {account.label}: {account.email}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
