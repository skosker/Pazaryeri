import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL_DOMAIN } from "@/lib/terms-acceptance";

/**
 * Aracılık hizmet bedeli statements (Admin → Aracılık Dökümleri): one row per payout,
 * i.e. per order a real buyer paid for and approved on the site. Built only from those
 * records — generated showcase profiles, demo accounts and orders imported from a bank
 * spreadsheet are left out, and there is no way to add a row by hand.
 */

export type IntermediaryRow = {
  payoutId: string;
  orderId: string;
  orderedAt: Date;
  /** The payout is written when the buyer approves the delivery. */
  completedAt: Date;
  buyer: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
  service: string;
  packageName: string;
  /** Package price: what the fee and the payout are computed from. */
  gross: number;
  /** What the buyer actually paid (gross less the discounts Prosinta covers). */
  buyerPaid: number;
  prosintaDiscounts: number;
  commission: number;
  commissionPercent: number;
  net: number;
  payout: { status: "PENDING" | "PAID" | "FAILED"; paidAt: Date | null; iban: string | null; ibanHolder: string | null };
  payment: { provider: string; at: Date } | null;
  invoiceNo: string | null;
  invoicedAt: Date | null;
};

const select = {
  id: true, status: true, gross: true, commission: true, net: true, iban: true, ibanHolder: true,
  paidAt: true, invoiceNo: true, invoicedAt: true, createdAt: true,
  seller: { select: { id: true, name: true, email: true, synthetic: true } },
  order: {
    select: {
      id: true, createdAt: true, amount: true, discount: true, creditDiscount: true, corporateDiscount: true,
      buyer: { select: { id: true, name: true, email: true, synthetic: true } },
      gig: { select: { title: true } },
      package: { select: { name: true } },
      payment: { select: { provider: true, status: true, rawResponse: true, updatedAt: true } },
    },
  },
} as const;

type Raw = NonNullable<Awaited<ReturnType<typeof fetchOne>>>;
const fetchOne = (id: string) => prisma.payout.findUnique({ where: { id }, select });

const imported = (raw: unknown) =>
  typeof raw === "object" && raw !== null && (raw as { imported?: unknown }).imported === true;

/** A real, on-site transaction between two people who signed up themselves. */
function isReal(p: Raw): boolean {
  const people = [p.seller, p.order.buyer];
  if (people.some((u) => u.synthetic || u.email.endsWith(DEMO_EMAIL_DOMAIN))) return false;
  return !imported(p.order.payment?.rawResponse);
}

function toRow(p: Raw): IntermediaryRow {
  const gross = Number(p.gross);
  const discounts = Number(p.order.discount) + Number(p.order.creditDiscount) + Number(p.order.corporateDiscount);
  const commission = Number(p.commission);
  return {
    payoutId: p.id,
    orderId: p.order.id,
    orderedAt: p.order.createdAt,
    completedAt: p.createdAt,
    buyer: { id: p.order.buyer.id, name: p.order.buyer.name, email: p.order.buyer.email },
    seller: { id: p.seller.id, name: p.seller.name, email: p.seller.email },
    service: p.order.gig.title,
    packageName: p.order.package.name,
    gross,
    buyerPaid: Math.round((Number(p.order.amount) - discounts) * 100) / 100,
    prosintaDiscounts: Math.round(discounts * 100) / 100,
    commission,
    commissionPercent: gross > 0 ? Math.round((commission / gross) * 10000) / 100 : 0,
    net: Number(p.net),
    payout: { status: p.status, paidAt: p.paidAt, iban: p.iban, ibanHolder: p.ibanHolder },
    payment:
      p.order.payment && p.order.payment.status === "SUCCESS"
        ? { provider: p.order.payment.provider, at: p.order.payment.updatedAt }
        : null,
    invoiceNo: p.invoiceNo,
    invoicedAt: p.invoicedAt,
  };
}

/** Rows completed in [from, to], newest first. */
export async function listIntermediaryRows(range: { from?: Date; to?: Date }): Promise<IntermediaryRow[]> {
  const createdAt = range.from || range.to ? { ...(range.from ? { gte: range.from } : {}), ...(range.to ? { lte: range.to } : {}) } : undefined;
  const payouts = await prisma.payout.findMany({
    where: createdAt ? { createdAt } : {},
    orderBy: { createdAt: "desc" },
    take: 2000,
    select,
  });
  return payouts.filter(isReal).map(toRow);
}

/** One statement, or null when the payout is missing or not a real on-site transaction. */
export async function intermediaryRow(payoutId: string): Promise<IntermediaryRow | null> {
  const p = await fetchOne(payoutId);
  return p && isReal(p) ? toRow(p) : null;
}

export const PAYMENT_PROVIDER_LABEL: Record<string, string> = {
  havale: "Havale/EFT",
  bakiye: "Kurumsal bakiye",
  paytr: "Kart (PayTR)",
  iyzico: "Kart (iyzico)",
  mock: "Test ödemesi",
};

/** "gg.aa.yyyy" or "yyyy-mm-dd" → Date (Istanbul day start, or end with `end`); else undefined. */
export function parseDay(value: string, end = false): Date | undefined {
  const v = value.trim();
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? v.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!m) return undefined;
  const [y, mo, d] = m[1].length === 4 ? [m[1], m[2], m[3]] : [m[3], m[2], m[1]];
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${end ? "23:59:59.999" : "00:00:00"}+03:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
