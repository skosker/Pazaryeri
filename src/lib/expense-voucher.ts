import { prisma } from "@/lib/prisma";
import { lineTotal, type VoucherItem } from "@/lib/expense-voucher-math";

/**
 * Gider pusulası (VUK m. 234): what Prosinta buys for itself from a person who is not a
 * taxpayer. Admin → Gider Pusulaları records them with a gap-free sıra numarası and prints
 * them; this file holds the reads, the arithmetic is in expense-voucher-math.
 */

export * from "@/lib/expense-voucher-math";

export type VoucherRow = {
  id: string;
  number: number;
  issuedAt: Date;
  payeeName: string;
  payeeTckn: string;
  payeeAddress: string;
  payeeIban: string | null;
  items: (VoucherItem & { total: number })[];
  gross: number;
  withholdingPercent: number;
  withholding: number;
  net: number;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
};

type Raw = NonNullable<Awaited<ReturnType<typeof prisma.expenseVoucher.findUnique>>>;

function toRow(v: Raw): VoucherRow {
  const items = (Array.isArray(v.items) ? v.items : []) as VoucherItem[];
  return {
    id: v.id,
    number: v.number,
    issuedAt: v.issuedAt,
    payeeName: v.payeeName,
    payeeTckn: v.payeeTckn,
    payeeAddress: v.payeeAddress,
    payeeIban: v.payeeIban,
    items: items.map((item) => ({ ...item, total: lineTotal(item) })),
    gross: Number(v.gross),
    withholdingPercent: Number(v.withholdingPercent),
    withholding: Number(v.withholding),
    net: Number(v.net),
    cancelledAt: v.cancelledAt,
    cancelReason: v.cancelReason,
    createdAt: v.createdAt,
  };
}

/** Vouchers dated in [from, to], newest sıra no first. */
export async function listVouchers(range: { from?: Date; to?: Date }): Promise<VoucherRow[]> {
  const issuedAt = range.from || range.to ? { ...(range.from && { gte: range.from }), ...(range.to && { lte: range.to }) } : undefined;
  const rows = await prisma.expenseVoucher.findMany({
    where: issuedAt ? { issuedAt } : {},
    orderBy: { number: "desc" },
    take: 2000,
  });
  return rows.map(toRow);
}

export async function getVoucher(id: string): Promise<VoucherRow | null> {
  const v = await prisma.expenseVoucher.findUnique({ where: { id } });
  return v ? toRow(v) : null;
}
