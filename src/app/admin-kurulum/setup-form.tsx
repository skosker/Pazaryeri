"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setAdminPasswordAction, type FormState } from "./actions";

const initialState: FormState = {};

const fieldClass =
  "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

export function AdminSetupForm() {
  const [state, formAction, pending] = useActionState(setAdminPasswordAction, initialState);

  if (state.done) {
    return (
      <div className="text-sm">
        <p className="font-semibold text-emerald-700">Şifre belirlendi.</p>
        <p className="mt-2 text-slate-600">
          Artık{" "}
          <Link href="/giris" className="font-semibold text-purple-700 hover:underline">
            giriş yapabilirsin
          </Link>
          . Vercel&apos;den <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_SETUP_TOKEN</code>{" "}
          değişkenini silmeyi unutma.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Kurulum anahtarı
        <input
          name="token"
          type="password"
          required
          placeholder="Vercel'e girdiğin ADMIN_SETUP_TOKEN"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yönetici e-postası
        <input
          name="email"
          type="email"
          required
          defaultValue="admin@profestia.dev"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Yeni şifre
        <input
          name="password"
          type="password"
          required
          minLength={10}
          placeholder="En az 10 karakter"
          className={fieldClass}
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Şifreyi Belirle"}
      </button>
    </form>
  );
}
