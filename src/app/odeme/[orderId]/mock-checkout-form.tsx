"use client";

import { useTransition } from "react";
import { completeMockPayment, failMockPayment } from "./actions";

export function MockCheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Test/Demo modu: gerçek iyzico API anahtarı tanımlı değil. Bu form ödeme akışını
        simüle eder, gerçek kart bilgisi çekilmez.
      </div>

      <h2 className="font-semibold text-brand-navy">Kart ile Öde</h2>
      <p className="mt-1 text-sm text-slate-500">iyzico güvenli ödeme altyapısı</p>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
          Kart Numarası
          <input
            disabled
            placeholder="5528 7900 0000 0008"
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Son Kullanma
            <input
              disabled
              placeholder="12/30"
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            CVC
            <input
              disabled
              placeholder="123"
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">Ödenecek tutar</span>
        <span className="text-xl font-bold text-brand-navy">{amount}₺</span>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => completeMockPayment(orderId))}
        className="brand-gradient mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "İşleniyor..." : `${amount}₺ Öde`}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => failMockPayment(orderId))}
        className="mt-2 w-full rounded-full border border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-50"
      >
        Ödemeyi başarısız say (test)
      </button>
    </div>
  );
}
