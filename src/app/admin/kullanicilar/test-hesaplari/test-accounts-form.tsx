"use client";

import { useActionState, useState } from "react";
import { createTestAccountsAction, type TestAccountsState } from "./actions";
import { csvFile } from "@/lib/csv";

export function TestAccountsForm() {
  // Controlled, so a rejected list is not wiped; cleared once the accounts are open.
  const [names, setNames] = useState("");
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<TestAccountsState, FormData>(async (prev, formData) => {
    const result = await createTestAccountsAction(prev, formData);
    if (result.created) setNames("");
    setCopied(false);
    return result;
  }, {});
  const created = state.created ?? [];

  const rows = [["Ad Soyad", "E-posta", "Şifre"], ...created.map((a) => [a.name, a.email, a.password])];
  const copy = async () => {
    await navigator.clipboard.writeText(rows.map((r) => r.join("\t")).join("\n"));
    setCopied(true);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([csvFile(rows)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `prosinta-test-hesaplari-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6">
        <label htmlFor="names" className="mb-1 block text-xs font-medium text-slate-500">
          Ad Soyad (her satıra bir kişi)
        </label>
        <textarea
          id="names"
          name="names"
          value={names}
          onChange={(e) => setNames(e.target.value)}
          rows={12}
          placeholder={"ERHAN SUSEM\nMETİN YILMAZ\n…"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-purple-400"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Hesaplar açılıyor..." : "Test Hesaplarını Oluştur"}
          </button>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </div>
      </form>

      {created.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-emerald-800">{created.length} test hesabı açıldı</p>
            <button
              type="button"
              onClick={copy}
              className="ml-auto rounded-full border border-emerald-300 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-800 hover:border-emerald-400"
            >
              {copied ? "Kopyalandı ✓" : "Tümünü Kopyala"}
            </button>
            <button
              type="button"
              onClick={download}
              className="rounded-full border border-emerald-300 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-800 hover:border-emerald-400"
            >
              CSV İndir
            </button>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Şifreler yalnızca şimdi görünür; sayfadan ayrılmadan kopyala ya da indir. Kaybolan şifre için hesabın
            sayfasında &quot;Yeni Şifre Üret&quot;.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Ad Soyad</th>
                  <th className="px-4 py-2 font-medium">E-posta</th>
                  <th className="px-4 py-2 font-medium">Şifre</th>
                </tr>
              </thead>
              <tbody>
                {created.map((a) => (
                  <tr key={a.email} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-medium text-brand-navy">{a.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{a.email}</td>
                    <td className="px-4 py-2 font-mono text-xs">{a.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.existing && state.existing.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-semibold">Zaten açık olduğu için atlananlar (şifreleri değişmedi)</p>
          <ul className="mt-2 space-y-0.5">
            {state.existing.map((a) => (
              <li key={a.email}>
                {a.name} · <span className="font-mono text-xs">{a.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
