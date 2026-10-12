"use client";

import { useState, useTransition } from "react";
import { resetTestPasswordAction } from "./test-hesaplari/actions";

/** "Yeni Şifre Üret" on a bulk-opened test account; the new password is shown once, here. */
export function ResetTestPasswordButton({ userId, name }: { userId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ password?: string; error?: string } | null>(null);

  if (result?.password) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        Yeni şifre: <span className="select-all font-mono">{result.password}</span>
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`${name} için yeni şifre üretilsin mi? Eski şifre çalışmaz olur.`)) return;
          startTransition(async () => setResult(await resetTestPasswordAction(userId)));
        }}
        className="font-semibold text-purple-700 hover:underline disabled:opacity-60"
      >
        {pending ? "Üretiliyor..." : "Yeni Şifre Üret"}
      </button>
      {result?.error && <span className="ml-2 text-xs text-red-600">{result.error}</span>}
    </>
  );
}
