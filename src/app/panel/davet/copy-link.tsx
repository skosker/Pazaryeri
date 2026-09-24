"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm text-brand-navy"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        {copied ? "Kopyalandı" : "Bağlantıyı Kopyala"}
      </button>
    </div>
  );
}
