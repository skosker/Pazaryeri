import { prisma } from "@/lib/prisma";
import { PURCHASE_PLAN_LABEL } from "@/lib/membership";
import { needsNoInvoice, type RefundSummary } from "@/lib/refund-labels";

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
  /** Payment provider of a sale ("havale", "paytr", "bakiye"…); null for commission. */
  paidWith: string | null;
  /** A membership sale's refund (requested, refunded or turned down); null otherwise. */
  refund: RefundSummary | null;
  /** Bought by a test account: shown, but left out of totals and the export, and not invoiced. */
  test: boolean;
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
  tckn: true,
  isTester: true,
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
  tckn: string | null;
  isTester: boolean;
};

function customer(u: CustomerFields): InvoiceRow["customer"] {
  const address = [u.billingAddress, u.billingCity ? `${u.billingDistrict ?? ""} / ${u.billingCity}` : null]
    .filter(Boolean)
    .join(", ");
  return {
    name: u.name,
    email: u.email,
    companyName: u.companyName,
    taxOffice: u.companyName ? u.taxOffice : null,
    // A company is invoiced on its VKN; a person on their TCKN when they gave one.
    taxNumber: u.companyName ? u.taxNumber : u.tckn,
    address: address || null,
  };
}

const periodLabel = (months: number | null) => (months === 12 ? "Yıllık" : months === 1 ? "Aylık" : "Süresiz");

/** "Prosinta Pro Plus üyelik · Yıllık": how a membership or corporate plan sale is named. */
export function purchaseServiceLabel(plan: keyof typeof PURCHASE_PLAN_LABEL, months: number | null): string {
  return `Prosinta ${PURCHASE_PLAN_LABEL[plan]} ${plan.startsWith("KURUMSAL") ? "paket" : "üyelik"} · ${periodLabel(months)}`;
}

/**
 * Pending (not yet invoiced) or done, newest first; kind narrows to one source. A sale
 * refunded in full before it was invoiced is no longer to be invoiced, so it leaves the
 * pending list.
 */
export async function listInvoiceRows(done: boolean, kind?: InvoiceKind): Promise<InvoiceRow[]> {
  const rows = await queryInvoiceRows({ invoiced: done ? { not: null } : null, kind });
  return done ? rows : rows.filter((r) => !needsNoInvoice(r.refund, r.total, r.invoiceNo));
}

/** Everything one member bought from Prosinta (and, for a freelancer, the commission), invoiced or not. */
export async function listUserInvoiceRows(userId: string): Promise<InvoiceRow[]> {
  return queryInvoiceRows({ userId });
}

async function queryInvoiceRows({
  invoiced,
  kind,
  userId,
}: {
  invoiced?: { not: null } | null;
  kind?: InvoiceKind;
  userId?: string;
}): Promise<InvoiceRow[]> {
  const take = 500;
  const invoiceFilter = invoiced === undefined ? {} : { invoiceNo: invoiced };
  const [purchases, boosts, payouts] = await Promise.all([
    !kind || kind === "uyelik"
      ? prisma.proPurchase.findMany({
          where: { status: "SUCCESS", amount: { gt: 0 }, ...invoiceFilter, ...(userId ? { userId } : {}) },
          select: {
            id: true, plan: true, months: true, amount: true, createdAt: true, paidAt: true, invoiceNo: true, invoicedAt: true, provider: true,
            user: { select: customerSelect },
            refund: { select: { status: true, amount: true, decidedAt: true, rejectReason: true } },
          },
          orderBy: { createdAt: "desc" },
          take,
        })
      : [],
    !kind || kind === "one-cikar"
      ? prisma.gigBoost.findMany({
          where: { status: "SUCCESS", amount: { gt: 0 }, creditMonth: null, ...invoiceFilter, ...(userId ? { userId } : {}) },
          select: {
            id: true, days: true, amount: true, activatedAt: true, updatedAt: true, invoiceNo: true, invoicedAt: true, provider: true,
            gig: { select: { title: true } },
            user: { select: customerSelect },
          },
          orderBy: { updatedAt: "desc" },
          take,
        })
      : [],
    !kind || kind === "komisyon"
      ? prisma.payout.findMany({
          where: { status: { not: "FAILED" }, commission: { gt: 0 }, ...invoiceFilter, ...(userId ? { sellerId: userId } : {}) },
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
      // Not updatedAt: that moves when the row is marked invoiced.
      date: p.paidAt ?? p.createdAt,
      customer: customer(p.user),
      service: purchaseServiceLabel(p.plan, p.months),
      total: Number(p.amount),
      invoiceNo: p.invoiceNo,
      invoicedAt: p.invoicedAt,
      paidWith: p.provider,
      refund: p.refund ? { ...p.refund, amount: p.refund.amount === null ? null : Number(p.refund.amount) } : null,
      test: p.user.isTester,
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
      paidWith: b.provider,
      refund: null,
      test: b.user.isTester,
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
      paidWith: null,
      refund: null,
      test: p.seller.isTester,
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

/** Which of these rows have an e-Arşiv PDF on file, as "kind:id" keys. */
export async function invoicePdfKeys(rows: Pick<InvoiceRow, "kind" | "id">[]): Promise<Set<string>> {
  if (rows.length === 0) return new Set();
  const files = await prisma.invoiceFile.findMany({
    where: { recordId: { in: rows.map((r) => r.id) } },
    select: { kind: true, recordId: true },
  });
  return new Set(files.map((f) => `${f.kind}:${f.recordId}`));
}

/** The member a sale (or commission) belongs to; null when the record does not exist. */
export async function invoiceOwnerId(kind: InvoiceKind, id: string): Promise<string | null> {
  if (kind === "uyelik") return (await prisma.proPurchase.findUnique({ where: { id }, select: { userId: true } }))?.userId ?? null;
  if (kind === "one-cikar") return (await prisma.gigBoost.findUnique({ where: { id }, select: { userId: true } }))?.userId ?? null;
  return (await prisma.payout.findUnique({ where: { id }, select: { sellerId: true } }))?.sellerId ?? null;
}

export const PAID_WITH_LABEL: Record<string, string> = {
  havale: "Havale/EFT",
  paytr: "Kredi / banka kartı",
  iyzico: "Kredi / banka kartı",
  bakiye: "Kurumsal bakiye",
};
