/**
 * Labels and choices for membership refunds, kept free of database code so the forms
 * (client components) can use them too. The rules themselves are in refunds.ts; the
 * policy behind them is İptal ve İade Koşulları m. 6–7: no cayma hakkı on memberships,
 * money back for a duplicate or wrong charge or a service Prosinta failed to provide,
 * returned the way it was paid.
 */

export const REFUND_REASONS = {
  MUKERRER: "Mükerrer ödeme",
  HATALI_TAHSILAT: "Hatalı tahsilat",
  HIZMET_SUNULAMADI: "Hizmet Platform kaynaklı sunulamadı",
  DIGER: "Diğer",
} as const;
export type RefundReason = keyof typeof REFUND_REASONS;

export const REFUND_METHOD_LABEL = {
  havale: "Havale/EFT (IBAN'a)",
  kart: "Karta iade",
  bakiye: "Kurumsal bakiyeye",
} as const;
export type RefundMethod = keyof typeof REFUND_METHOD_LABEL;

/** What was done about an invoice already cut for the sale. */
export const INVOICE_ACTION_LABEL = {
  kesilmedi: "Fatura kesilmemişti",
  "earsiv-iptal": "e-Arşiv fatura iptal edildi",
  "iade-faturasi": "Alıcının iade faturası alındı",
  bekliyor: "Fatura işlemi bekliyor",
} as const;
export type InvoiceAction = keyof typeof INVOICE_ACTION_LABEL;

/** What a refund does to the membership the purchase paid for. */
export const MEMBERSHIP_CHANGE_LABEL = {
  end: "Üyeliği bugün sonlandır",
  shorten: "Süreyi bu satın alma kadar kısalt",
  keep: "Üyeliğe dokunma",
} as const;
export type MembershipChange = keyof typeof MEMBERSHIP_CHANGE_LABEL;

const pick =
  <T extends Record<string, string>>(labels: T) =>
  (value: unknown): keyof T | null =>
    typeof value === "string" && Object.hasOwn(labels, value) ? (value as keyof T) : null;

export const parseRefundReason = pick(REFUND_REASONS);
export const parseRefundMethod = pick(REFUND_METHOD_LABEL);
export const parseInvoiceAction = pick(INVOICE_ACTION_LABEL);
export const parseMembershipChange = pick(MEMBERSHIP_CHANGE_LABEL);

/**
 * A TL amount as typed: "1.500,50", "1500,50", "1500.50" or "1.500" (a dot before
 * exactly three digits is a thousands separator). NaN when it is not an amount.
 */
export function parseTlAmount(value: string): number {
  const v = value.trim().replace(/\s/g, "");
  let normalized = v;
  if (v.includes(",")) normalized = v.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(v)) normalized = v.replace(/\./g, "");
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
}

/** An amount written back into an input so parseTlAmount reads it unchanged: 1500 → "1500,00". */
export const tlInputValue = (n: number) => n.toFixed(2).replace(".", ",");

/** The way the money came in decides the way it goes back. */
export function methodForProvider(provider: string): RefundMethod {
  if (provider === "havale") return "havale";
  if (provider === "bakiye") return "bakiye";
  return "kart";
}

export type RefundSummary = {
  status: "REQUESTED" | "REFUNDED" | "REJECTED";
  amount: number | null;
  decidedAt: Date | null;
  rejectReason: string | null;
};

/** A refunded amount below what was paid. */
export const isPartialRefund = (refund: RefundSummary, total: number) =>
  refund.status === "REFUNDED" && refund.amount !== null && refund.amount < total;

/** Fully refunded and never invoiced: no invoice is to be cut for it any more. */
export const needsNoInvoice = (refund: RefundSummary | null, total: number, invoiceNo: string | null) =>
  !invoiceNo && refund?.status === "REFUNDED" && !isPartialRefund(refund, total);
