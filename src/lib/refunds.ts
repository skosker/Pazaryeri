import { prisma } from "@/lib/prisma";
import { Prisma, type RefundStatus } from "@/generated/prisma/client";
import { addMonths, istanbulMonth } from "@/lib/membership";
import { isCorpPlan } from "@/lib/corporate-plans";
import type { InvoiceAction, MembershipChange, RefundMethod, RefundReason } from "@/lib/refund-labels";

/**
 * Membership and corporate plan refunds (MembershipRefund). A member asks from
 * Faturalarım, or an admin starts one without a request; the admin then refunds (after
 * sending the money back, or at once onto a corporate balance) or rejects it. The
 * purchase itself stays SUCCESS — the money did come in — and the refund is its own row,
 * which Faturalar, Gelir Raporu and the member's receipt read.
 */

export class RefundError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

const caseSelect = {
  id: true,
  plan: true,
  months: true,
  amount: true,
  provider: true,
  status: true,
  createdAt: true,
  invoiceNo: true,
  invoicedAt: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      iban: true,
      ibanHolder: true,
      isTester: true,
      isPro: true,
      proUntil: true,
      proPlus: true,
      corpPlan: true,
      corpPlanUntil: true,
    },
  },
  refund: true,
} satisfies Prisma.ProPurchaseSelect;

export type RefundCase = Prisma.ProPurchaseGetPayload<{ select: typeof caseSelect }>;

/** A purchase and its refund (if any), with what the refund screens show about the member. */
export function getRefundCase(purchaseId: string): Promise<RefundCase | null> {
  return prisma.proPurchase.findUnique({ where: { id: purchaseId }, select: caseSelect });
}

/** Only a paid purchase with money in it can be refunded. */
export const isRefundable = (p: { status: string; amount: Prisma.Decimal | number }) =>
  p.status === "SUCCESS" && Number(p.amount) > 0;

/**
 * The end of the membership this purchase paid for, as it stands now: the corporate
 * plan's end for a corporate purchase, the Pro period's end otherwise. Null for a
 * one-off süresiz Pro purchase, which has no end.
 */
export function currentUntil(c: Pick<RefundCase, "plan" | "months" | "user">): Date | null {
  if (isCorpPlan(c.plan)) return c.user.corpPlanUntil;
  if (c.months === null) return null;
  return c.user.proUntil;
}

/**
 * Where `change` leaves the membership's end. "shorten" takes the purchase's months off
 * the current end — exact when nothing was bought after it, a fair approximation when a
 * plan change converted days — and never into the past.
 */
export function untilAfter(
  change: MembershipChange,
  until: Date | null,
  months: number | null,
  now = new Date()
): Date | null {
  if (change === "keep" || !until || until <= now) return until;
  if (change === "end" || months === null) return now;
  const shortened = addMonths(until, -months);
  return shortened > now ? shortened : now;
}

/** Member: ask for a refund of one of their own purchases. */
export async function requestRefund(input: {
  userId: string;
  purchaseId: string;
  reason: RefundReason;
  note: string;
  iban: string | null;
  ibanHolder: string | null;
}) {
  const purchase = await prisma.proPurchase.findUnique({
    where: { id: input.purchaseId },
    select: { userId: true, status: true, amount: true },
  });
  if (!purchase || purchase.userId !== input.userId) throw new RefundError("Satın alma bulunamadı.");
  if (!isRefundable(purchase)) throw new RefundError("Bu satın alma için iade talebi açılamaz.");
  try {
    return await prisma.membershipRefund.create({
      data: {
        purchaseId: input.purchaseId,
        reason: input.reason,
        note: input.note,
        iban: input.iban,
        ibanHolder: input.ibanHolder,
        requestedAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new RefundError("Bu satın alma için zaten bir iade kaydı var.");
    }
    throw error;
  }
}

/** Member: withdraw a request the admin has not decided yet. */
export async function withdrawRefundRequest(userId: string, purchaseId: string): Promise<boolean> {
  const { count } = await prisma.membershipRefund.deleteMany({
    where: { purchaseId, status: "REQUESTED", purchase: { userId } },
  });
  return count > 0;
}

/**
 * Admin: record the refund. For a bank transfer or card the admin has already sent the
 * money back and gives its reference; a corporate balance is credited here. Only the
 * call that moves the row to REFUNDED changes the membership or the balance, so a double
 * submit cannot refund twice.
 */
export async function refundPurchase(input: {
  purchaseId: string;
  adminId: string;
  amount: number;
  method: RefundMethod;
  reference: string | null;
  invoiceAction: InvoiceAction;
  membership: MembershipChange;
  /** Required when there is no member request to take it from. */
  reason: RefundReason | null;
  note: string | null;
}) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const c = await tx.proPurchase.findUnique({ where: { id: input.purchaseId }, select: caseSelect });
    if (!c || !isRefundable(c)) throw new RefundError("Bu satın alma iade edilemez.");
    const paid = Number(c.amount);
    const amount = round2(input.amount);
    if (!(amount > 0) || amount > paid) throw new RefundError(`İade tutarı 0 ile ${paid} TL arasında olmalı.`);
    if (input.method === "bakiye" && !c.user.companyName && c.provider !== "bakiye") {
      throw new RefundError("Bakiyeye iade yalnızca kurumsal hesaplarda yapılabilir.");
    }

    const prevUntil = currentUntil(c);
    const newUntil = untilAfter(input.membership, prevUntil, c.months, now);
    const decided = {
      status: "REFUNDED" as const,
      amount,
      method: input.method,
      reference: input.reference,
      invoiceAction: input.invoiceAction,
      prevUntil,
      newUntil,
      rejectReason: null,
      decidedAt: now,
      decidedById: input.adminId,
    };

    if (c.refund) {
      const { count } = await tx.membershipRefund.updateMany({
        where: { purchaseId: c.id, status: { not: "REFUNDED" } },
        data: decided,
      });
      if (count === 0) throw new RefundError("Bu satın alma zaten iade edilmiş.");
    } else {
      if (!input.reason) throw new RefundError("İade gerekçesini seç.");
      await tx.membershipRefund.create({
        data: { purchaseId: c.id, reason: input.reason, note: input.note, ...decided },
      });
    }

    if (input.membership !== "keep") {
      if (isCorpPlan(c.plan)) {
        if (newUntil?.getTime() !== prevUntil?.getTime()) {
          await tx.user.update({ where: { id: c.userId }, data: { corpPlanUntil: newUntil } });
        }
      } else if (c.months === null) {
        await tx.user.update({ where: { id: c.userId }, data: { isPro: false } });
      } else if (newUntil?.getTime() !== prevUntil?.getTime()) {
        // Ended today: the Pro Plus flag goes with the period.
        const ended = newUntil !== null && newUntil.getTime() <= now.getTime();
        await tx.user.update({
          where: { id: c.userId },
          data: { proUntil: newUntil, ...(ended ? { proPlus: false } : {}) },
        });
      }
    }

    if (input.method === "bakiye") {
      await tx.user.update({ where: { id: c.userId }, data: { balance: { increment: amount } } });
      await tx.balanceEntry.create({
        data: { userId: c.userId, kind: "REFUND", amount, note: "Paket iadesi" },
      });
    }
    return { ...c, refundAmount: amount, newUntil };
  });
}

/** Admin: turn a request down, with the reason the member sees. */
export async function rejectRefund(purchaseId: string, adminId: string, reason: string): Promise<boolean> {
  const { count } = await prisma.membershipRefund.updateMany({
    where: { purchaseId, status: "REQUESTED" },
    data: { status: "REJECTED", rejectReason: reason, decidedAt: new Date(), decidedById: adminId },
  });
  return count > 0;
}

/** Admin: the invoice step after the refund (e.g. the iade faturası has now arrived). */
export async function setRefundInvoiceAction(purchaseId: string, invoiceAction: InvoiceAction) {
  await prisma.membershipRefund.updateMany({ where: { purchaseId, status: "REFUNDED" }, data: { invoiceAction } });
}

const listSelect = {
  id: true,
  status: true,
  reason: true,
  amount: true,
  method: true,
  invoiceAction: true,
  requestedAt: true,
  decidedAt: true,
  createdAt: true,
  rejectReason: true,
  purchase: {
    select: {
      id: true,
      plan: true,
      months: true,
      amount: true,
      provider: true,
      createdAt: true,
      invoiceNo: true,
      user: { select: { id: true, name: true, email: true, companyName: true, isTester: true } },
    },
  },
} satisfies Prisma.MembershipRefundSelect;

export function listRefunds(status: RefundStatus) {
  return prisma.membershipRefund.findMany({
    where: { status },
    select: listSelect,
    orderBy: status === "REQUESTED" ? { createdAt: "asc" } : { decidedAt: "desc" },
    take: 300,
  });
}

/** Start of this Istanbul calendar month, as an instant. */
function istanbulMonthStart(now = new Date()): Date {
  return new Date(`${istanbulMonth(now)}-01T00:00:00+03:00`);
}

export async function refundStats() {
  const [requested, refundedThisMonth, invoicePending] = await Promise.all([
    prisma.membershipRefund.count({ where: { status: "REQUESTED" } }),
    prisma.membershipRefund.aggregate({
      where: { status: "REFUNDED", decidedAt: { gte: istanbulMonthStart() } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.membershipRefund.count({ where: { status: "REFUNDED", invoiceAction: "bekliyor" } }),
  ]);
  return {
    requested,
    refundedThisMonth: Number(refundedThisMonth._sum.amount ?? 0),
    refundedThisMonthCount: refundedThisMonth._count,
    invoicePending,
  };
}
