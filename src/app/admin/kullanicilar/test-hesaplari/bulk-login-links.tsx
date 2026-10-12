"use client";

import { useState, useTransition } from "react";
import { createAllLoginLinksAction, type BulkLoginLink } from "./actions";

const timeFmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

/** One press: a fresh 10-minute sign-in link for every test account, ready to copy. */
export function BulkLoginLinks() {
  const [pending, startTransition] = useTransition();
  const [links, setLinks] = useState<(BulkLoginLink & { url: string })[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () =>
    startTransition(async () => {
      const result = await createAllLoginLinksAction();
      setLinks(result.links.map((l) => ({ ...l, url: window.location.origin + l.path })));
      setExpiresAt(new Date(result.expiresAt));
      setCopied(null);
    });
  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-navy">Şifresiz Giriş Linkleri</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Her test hesabı için yeni bir link üretir; her link tek kullanımlıktır ve 10 dakika geçerlidir. Gizli pencerede aç.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="brand-gradient ml-auto rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Oluşturuluyor..." : links.length ? "Linkleri Yenile (10 dk)" : "Tüm Giriş Linklerini Oluştur"}
        </button>
      </div>

      {links.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">
              {links.length} link · <strong className="text-brand-navy">{expiresAt ? timeFmt.format(expiresAt) : ""}</strong>&apos;e kadar geçerli
            </span>
            <button
              type="button"
              onClick={() => copy("all", links.map((l) => `${l.name}\t${l.url}`).join("\n"))}
              className="rounded-full border border-purple-200 px-3 py-1.5 font-semibold text-purple-700 hover:bg-purple-50"
            >
              {copied === "all" ? "Kopyalandı ✓" : "Tümünü Kopyala"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <tbody>
                {links.map((l) => (
                  <tr key={l.email} className="border-b border-slate-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-brand-navy">{l.name}</td>
                    <td className="px-4 py-2">
                      <input
                        readOnly
                        value={l.url}
                        onFocus={(e) => e.target.select()}
                        className="w-full min-w-48 rounded-lg border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => copy(l.email, l.url)}
                        className="whitespace-nowrap rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                      >
                        {copied === l.email ? "Kopyalandı ✓" : "Kopyala"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
