"use client";

import { useTransition, useState } from "react";
import { notifyBankTransfer } from "./actions";
import type { BankTransferInfo } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";

function AccountCard({ account }: { account: BankTransferInfo }) {
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(account.iban.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Hesap Sahibi</span>
        <span className="font-medium text-brand-navy">{account.accountHolder}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Banka</span>
        <span className="font-medium text-brand-navy">{account.bankName}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-slate-500">IBAN</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-brand-navy sm:text-sm">
            {account.iban}
          </span>
          <button
            type="button"
            onClick={copyIban}
            className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-white"
          >
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BankTransferPanel({
  orderId,
  amount,
  accounts,
}: {
  orderId: string;
  amount: number;
  accounts: BankTransferInfo[];
}) {
  const [pending, startTransition] = useTransition();
  const many = accounts.length > 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-brand-navy">Havale/EFT ile Öde</h2>
      <p className="mt-1 text-sm text-slate-500">
        {many
          ? "Aşağıdaki hesaplardan birine ödemeyi yaptıktan sonra "
          : "Aşağıdaki hesaba ödemeyi yaptıktan sonra "}
        &quot;Ödeme Bildirimi Yap&quot; butonuna bas.
        {many ? " Kendi bankandaki hesaba EFT masrafsız ve anında olur." : ""}
      </p>

      <div className="mt-4 space-y-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">Ödenecek tutar</span>
        <span className="text-xl font-bold text-brand-navy">{formatPrice(amount)}₺</span>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => notifyBankTransfer(orderId))}
        className="brand-gradient mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor..." : "Ödeme Bildirimi Yap"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Bildirim sonrası satıcı ödemeyi kontrol edip onaylayacak, siparişin durumu güncellenecek.
      </p>
    </div>
  );
}
