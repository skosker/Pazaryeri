"use client";

import { useState, useTransition } from "react";
import { createLoginLinkAction } from "./actions";

/** "Giriş Linki": a one-time link to sign in as this test account, to copy into a private window. */
export function LoginLinkButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (url) {
    return (
      <div className="flex items-center gap-1.5">
        <input readOnly value={url} onFocus={(e) => e.target.select()} className="w-40 rounded-lg border border-slate-300 px-2 py-1 font-mono text-[11px] text-slate-600" />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
          className="whitespace-nowrap rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
        >
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await createLoginLinkAction(userId);
            if (result.path) setUrl(window.location.origin + result.path);
            else setError(result.error ?? "Link oluşturulamadı.");
          })
        }
        className="whitespace-nowrap rounded-full border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
      >
        {pending ? "..." : "Giriş Linki"}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </>
  );
}
