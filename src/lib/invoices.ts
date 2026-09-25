import { prisma } from "@/lib/prisma";
import { PURCHASE_PLAN_LABEL } from "@/lib/membership";

/**
 * What Prosinta has to invoice, gathered from three places into one list for
 * Admin → Faturalar: memberships and corporate plans sold (ProPurchase), paid "Öne Çıkar"
 * (GigBoost), and the commission kept from freelancers' payouts (Payout). Prices include
 * KDV; the admin cuts the invoice in the accounting software and records its number here.
 */

export type InvoiceKind = "uyelik" | "one-cikar" | "komisyon";

export const INVOICE_KIND_LABEL: Record<InvoiceKind, string> = {
  uyelik: "Üyelik / Paket",
  "one-cikar": "Öne Çıkar",
  komisyon: "Komisyon",
};

export type InvoiceRow = {
  kind: InvoiceKind;
  id: string;
  date: Date;
  customer: {
    name: string;
    email: string;
    companyName: string | null;
    taxOffice: string | null;
    taxNumber: string | null;
    address: string | null;
  };
  service: string;
  /** KDV dahil. */
  total: number;
  invoiceNo: string | null;
  invoicedAt: Date | null;
};

const customerSelect = {
  name: true,
  email: true,
  companyName: true,
  taxOffice: true,
  taxNumber: true,
  billingAddress: true,
  billingDistrict: true,
  billingCity: true,
} as const;

type CustomerFields = {
  name: string;
  email: string;
  companyName: string | null;
  taxOffice: string | null;
  taxNumber: string | null;
  billingAddress: string | null;
  billingDistrict: string | null;
  billingCity: string | null;
};

function customer(u: CustomerFields): InvoiceRow["customer"] {
  const address = [u.billingAddress, u.billingCity ? `${u.billingDistrict ?? ""} / ${u.billingCity}` : null]
    .filter(Boolean)
    .join(", ");
  return {
    name: u.name,
    email: u.email,
    companyName: u.companyName,
    taxOffice: u.taxOffice,
    taxNumber: u.taxNumber,
    address: address || null,
  };
}

const periodLabel = (months: number | null) => (months === 12 ? "Yıllık" : months === 1 ? "Aylık" : "Süresiz");

/** Pending (not yet invoiced) or done, newest first; kind narrows to one source. */
export async function listInvoiceRows(done: boolean, kind?: InvoiceKind): Promise<InvoiceRow[]> {
  const invoiced = done ? { not: null } : null;
  const take = 500;
  const [purchases, boosts, payouts] = await Promise.all([
    !kind || kind === "uyelik"
      ? prisma.proPurchase.findMany({
          where: { status: "SUCCESS", amount: { gt: 0 }, invoiceNo: invoiced },
          select: {
            id: true, plan: true, months: true, amount: true, updatedAt: true, invoiceNo: true, invoicedAt: true,
            user: { select: customerSelect },
          },
          orderBy: { updatedAt: "desc" },
          take,
        })
      : [],
    !kind || kind === "one-cikar"
      ? prisma.gigBoost.findMany({
          where: { status: "SUCCESS", amount: { gt: 0 }, creditMonth: null, invoiceNo: invoiced },
          select: {
            id: true, days: true, amount: true, activatedAt: true, updatedAt: true, invoiceNo: true, invoicedAt: true,
            gig: { select: { title: true } },
            user: { select: customerSelect },
          },
          orderBy: { updatedAt: "desc" },
          take,
        })
      : [],
    !kind || kind === "komisyon"
      ? prisma.payout.findMany({
          where: { status: { not: "FAILED" }, commission: { gt: 0 }, invoiceNo: invoiced },
          select: {
            id: true, commission: true, createdAt: true, paidAt: true, invoiceNo: true, invoicedAt: true,
            order: { select: { id: true, gig: { select: { title: true } } } },
            seller: { select: customerSelect },
          },
          orderBy: { createdAt: "desc" },
          take,
        })
      : [],
  ]);

  const rows: InvoiceRow[] = [
    ...purchases.map((p) => ({
      kind: "uyelik" as const,
      id: p.id,
      date: p.updatedAt,
      customer: customer(p.user),
      service: `Prosinta ${PURCHASE_PLAN_LABEL[p.plan]} ${p.plan.startsWith("KURUMSAL") ? "paket" : "üyelik"} · ${periodLabel(p.months)}`,
      total: Number(p.amount),
      invoiceNo: p.invoiceNo,
      invoicedAt: p.invoicedAt,
    })),
    ...boosts.map((b) => ({
      kind: "one-cikar" as const,
      id: b.id,
      date: b.activatedAt ?? b.updatedAt,
      customer: customer(b.user),
      service: `Öne Çıkar (${b.days} gün) · ${b.gig.title}`,
      total: Number(b.amount),
      invoiceNo: b.invoiceNo,
      invoicedAt: b.invoicedAt,
    })),
    ...payouts.map((p) => ({
      kind: "komisyon" as const,
      id: p.id,
      date: p.paidAt ?? p.createdAt,
      customer: customer(p.seller),
      service: `Aracılık hizmet bedeli · Sipariş #${p.order.id.slice(-8)} · ${p.order.gig.title}`,
      total: Number(p.commission),
      invoiceNo: p.invoiceNo,
      invoicedAt: p.invoicedAt,
    })),
  ];
  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** KDV-inclusive total split into matrah and KDV at `vatPercent`. */
export function splitVat(total: number, vatPercent: number) {
  const base = Math.round((total * 10000) / (100 + vatPercent)) / 100;
  return { base, vat: Math.round((total - base) * 100) / 100 };
}

/** Record (or with null, clear) the invoice number of one sale. */
export async function setInvoice(kind: InvoiceKind, id: string, invoiceNo: string | null) {
  const data = { invoiceNo, invoicedAt: invoiceNo ? new Date() : null };
  if (kind === "uyelik") await prisma.proPurchase.update({ where: { id }, data });
  else if (kind === "one-cikar") await prisma.gigBoost.update({ where: { id }, data });
  else await prisma.payout.update({ where: { id }, data });
}

export function parseInvoiceKind(value: unknown): InvoiceKind | undefined {
  return value === "uyelik" || value === "one-cikar" || value === "komisyon" ? value : undefined;
}
