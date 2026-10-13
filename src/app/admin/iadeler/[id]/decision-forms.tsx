"use client";

import { useActionState, useState } from "react";
import type { DecisionState } from "../actions";
import {
  INVOICE_ACTION_LABEL,
  MEMBERSHIP_CHANGE_LABEL,
  REFUND_METHOD_LABEL,
  REFUND_REASONS,
  parseTlAmount,
  tlInputValue,
  type MembershipChange,
  type RefundMethod,
} from "@/lib/refund-labels";
import { formatPrice } from "@/lib/format-price";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";
const label = "mb-1 block text-xs font-medium text-slate-500";

type Action = (state: DecisionState, formData: FormData) => Promise<DecisionState>;

export function RefundForm({
  action,
  paid,
  defaultMethod,
  allowBalance,
  invoiced,
  needsReason,
  untilPreview,
}: {
  action: Action;
  paid: number;
  defaultMethod: RefundMethod;
  allowBalance: boolean;
  invoiced: boolean;
  needsReason: boolean;
  /** What each choice leaves the membership's end at, already worded. */
  untilPreview: Record<MembershipChange, string>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  // Controlled, so a rejected save keeps what was entered.
  const [amount, setAmount] = useState(tlInputValue(paid));
  const [method, setMethod] = useState<RefundMethod>(defaultMethod);
  const [reference, setReference] = useState("");
  const [membership, setMembership] = useState<MembershipChange>("end");
  const [invoiceAction, setInvoiceAction] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const value = parseTlAmount(amount);
  const partial = value > 0 && value < paid;

  return (
    <form action={formAction} className="space-y-5">
      {needsReason && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reason" className={label}>İade Gerekçesi</label>
            <select id="reason" name="reason" required value={reason} onChange={(e) => setReason(e.target.value)} className={`${field} bg-white`}>
              <option value="" disabled>Seç</option>
              {Object.entries(REFUND_REASONS).map(([k, t]) => (
                <option key={k} value={k}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="note" className={label}>Not (iç kayıt)</label>
            <input id="note" name="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn. Destek talebi #120" className={field} />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="amount" className={label}>İade Tutarı (TL)</label>
          <input id="amount" name="amount" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
          <p className="mt-1 text-xs text-slate-400">
            {partial ? (
              <>Kısmi iade · ödenen {formatPrice(paid)} TL</>
            ) : (
              <>Tam iade</>
            )}
            {partial && (
              <button type="button" onClick={() => setAmount(tlInputValue(paid))} className="ml-2 font-semibold text-purple-700 hover:underline">
                Tamamı
              </button>
            )}
          </p>
        </div>
        <div>
          <label htmlFor="method" className={label}>İade Yöntemi</label>
          <select id="method" name="method" value={method} onChange={(e) => setMethod(e.target.value as RefundMethod)} className={`${field} bg-white`}>
            {(Object.keys(REFUND_METHOD_LABEL) as RefundMethod[])
              .filter((m) => m !== "bakiye" || allowBalance)
              .map((m) => (
                <option key={m} value={m}>{REFUND_METHOD_LABEL[m]}</option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="reference" className={label}>{method === "bakiye" ? "Referans (isteğe bağlı)" : "Dekont / İşlem No"}</label>
          <input
            id="reference"
            name="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required={method !== "bakiye"}
            placeholder={method === "kart" ? "Kart iade işlem no" : method === "havale" ? "EFT dekont no" : ""}
            className={`${field} font-mono`}
          />
        </div>
      </div>
      {method === "bakiye" && (
        <p className="-mt-2 text-xs text-slate-500">Kaydedince tutar üyenin kurumsal bakiyesine hemen eklenir.</p>
      )}
      {method !== "bakiye" && (
        <p className="-mt-2 text-xs text-slate-500">
          Önce parayı {method === "kart" ? "ödeme kuruluşu panelinden karta" : "şirket hesabından üyenin IBAN'ına"} gönder, sonra burada kaydet.
        </p>
      )}

      <fieldset>
        <legend className={label}>Üyelik</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {(Object.keys(MEMBERSHIP_CHANGE_LABEL) as MembershipChange[]).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50"
            >
              <input type="radio" name="membership" value={k} checked={membership === k} onChange={() => setMembership(k)} className="mt-0.5 accent-purple-600" />
              <span>
                <span className="block font-medium text-brand-navy">{MEMBERSHIP_CHANGE_LABEL[k]}</span>
                <span className="block text-xs text-slate-500">{untilPreview[k]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {invoiced && (
        <div className="max-w-sm">
          <label htmlFor="invoiceAction" className={label}>Kesilmiş Fatura</label>
          <select id="invoiceAction" name="invoiceAction" required value={invoiceAction} onChange={(e) => setInvoiceAction(e.target.value)} className={`${field} bg-white`}>
            <option value="" disabled>Seç</option>
            {Object.entries(INVOICE_ACTION_LABEL)
              .filter(([k]) => k !== "kesilmedi")
              .map(([k, t]) => (
                <option key={k} value={k}>{t}</option>
              ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Bireysel alıcıda e-Arşiv iptali, kurumsal alıcıda iade faturası: mali müşavirinle teyit et.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : partial ? "Kısmi İadeyi Kaydet" : "İade Edildi Olarak Kaydet"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}

export function RejectForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [reason, setReason] = useState("");
  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="rejectReason" className={label}>Gerekçe (üye görür)</label>
      <textarea
        id="rejectReason"
        name="rejectReason"
        rows={4}
        required
        minLength={10}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Örn. Ödeme tek sefer alınmış; paket değişikliğinde kalan süre yeni pakete aktarıldığından nakit iade yapılmaz."
        className={field}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Talebi Reddet"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
