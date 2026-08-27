"use client";

import { useState } from "react";

/** Copies the IBAN (spaces stripped) so it can be pasted straight into a transfer. */
export function CopyIban({ iban }: { iban: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(iban.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
    >
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}
