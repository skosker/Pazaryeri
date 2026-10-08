"use client";

import { useActionState, useState } from "react";
import { createVoucherAction, type FormState } from "./actions";
import { amountInWords, voucherTotals } from "@/lib/expense-voucher-math";
import { formatPrice } from "@/lib/format-price";

const field =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";
const label = "mb-1 block text-xs font-medium text-slate-500";

type Line = { description: string; kind: string; quantity: string; unitPrice: string };
const emptyLine: Line = { description: "", kind: "", quantity: "1", unitPrice: "" };

/** "1.250,50" or "1250.50" → 1250.5; 0 while the field is empty or half typed. */
function num(v: string): number {
  const s = v.trim().replace(/\s/g, "");
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : 0;
}

export function VoucherForm({ today, defaultPercent }: { today: string; defaultPercent: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createVoucherAction, {});
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);
  const [percent, setPercent] = useState(defaultPercent);
  // Controlled, so a rejected save (bad TCKN, …) does not wipe what was typed.
  const [payee, setPayee] = useState({ payeeName: "", payeeTckn: "", payeeAddress: "", payeeIban: "", issuedAt: today });
  const bind = (name: keyof typeof payee) => ({
    id: name,
    name,
    value: payee[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPayee((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const totals = voucherTotals(
    lines.map((l) => ({ quantity: num(l.quantity), unitPrice: num(l.unitPrice) })),
    num(percent)
  );
  const set = (i: number, key: keyof Line, value: string) =>
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, [key]: value } : l)));

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-brand-navy">İşi Yapan (Hizmeti Veren)</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="payeeName" className={label}>Adı Soyadı</label>
            <input {...bind("payeeName")} required className={field} />
          </div>
          <div>
            <label htmlFor="payeeTckn" className={label}>T.C. Kimlik No</label>
            <input {...bind("payeeTckn")} required inputMode="numeric" maxLength={11} className={`${field} font-mono`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="payeeAddress" className={label}>Adresi</label>
            <input {...bind("payeeAddress")} required className={field} />
          </div>
          <div>
            <label htmlFor="payeeIban" className={label}>IBAN (kendi adına, isteğe bağlı)</label>
            <input {...bind("payeeIban")} placeholder="TR00 0000 0000 0000 0000 0000 00" className={`${field} font-mono`} />
          </div>
          <div>
            <label htmlFor="issuedAt" className={label}>Düzenleme Tarihi</label>
            <input {...bind("issuedAt")} type="date" required max={today} className={field} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-brand-navy">Yapılan İş</p>
        <div className="mt-4 space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_9rem_6rem_9rem_8rem_auto] sm:items-end">
              <div>
                {i === 0 && <span className={label}>İşin Mahiyeti</span>}
                <input name="description" value={l.description} onChange={(e) => set(i, "description", e.target.value)} placeholder="Örn. Sosyal medya görsel tasarımı" className={field} />
              </div>
              <div>
                {i === 0 && <span className={label}>Cinsi</span>}
                <input name="kind" value={l.kind} onChange={(e) => set(i, "kind", e.target.value)} placeholder="Adet / Saat" className={field} />
              </div>
              <div>
                {i === 0 && <span className={label}>Adedi</span>}
                <input name="quantity" value={l.quantity} onChange={(e) => set(i, "quantity", e.target.value)} inputMode="decimal" className={field} />
              </div>
              <div>
                {i === 0 && <span className={label}>Fiyatı (TL)</span>}
                <input name="unitPrice" value={l.unitPrice} onChange={(e) => set(i, "unitPrice", e.target.value)} inputMode="decimal" className={field} />
              </div>
              <div className="py-2 text-right text-sm font-semibold text-brand-navy">
                {formatPrice(Math.round(num(l.quantity) * num(l.unitPrice) * 100) / 100)} TL
              </div>
              <button
                type="button"
                onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                disabled={lines.length === 1}
                aria-label="Satırı sil"
                className="rounded-full px-2 py-2 text-slate-400 hover:text-red-600 disabled:invisible"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {lines.length < 8 && (
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}
            className="mt-3 text-sm font-semibold text-purple-700 hover:underline"
          >
            + Satır Ekle
          </button>
        )}

        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <label htmlFor="withholdingPercent" className={label}>Gelir Vergisi Stopaj Oranı (%)</label>
            <input
              id="withholdingPercent"
              name="withholdingPercent"
              required
              inputMode="decimal"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className={`${field} max-w-32`}
            />
            <p className="mt-1 text-xs text-slate-400">Oranı mali müşavirinin belirttiği şekilde gir; bir sonraki pusulada hatırlanır.</p>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Toplam</dt><dd className="font-semibold">{formatPrice(totals.gross)} TL</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Stopaj</dt><dd>−{formatPrice(totals.withholding)} TL</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-1.5"><dt className="font-semibold text-brand-navy">Ödenecek Net Tutar</dt><dd className="font-extrabold tracking-tight text-purple-600">{formatPrice(totals.net)} TL</dd></div>
            <div className="pt-1 text-xs text-slate-400">Yalnız: {amountInWords(totals.gross)}</div>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Kaydet ve Sıra No Al"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
      <p className="text-xs text-slate-400">
        Kaydedilen pusula silinemez; sıra numarası kesintisiz ilerler. Hatalı kayıt gerekçesiyle iptal edilir.
      </p>
    </form>
  );
}
