import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format-price";
import { formatIban } from "@/lib/iban";
import { PAID_WITH_LABEL, purchaseServiceLabel } from "@/lib/invoices";
import { PURCHASE_PLAN_LABEL, untilFormat } from "@/lib/membership";
import { isCorpPlan } from "@/lib/corporate-plans";
import {
  INVOICE_ACTION_LABEL,
  MEMBERSHIP_CHANGE_LABEL,
  REFUND_METHOD_LABEL,
  REFUND_REASONS,
  methodForProvider,
  type InvoiceAction,
  type MembershipChange,
  type RefundMethod,
  type RefundReason,
} from "@/lib/refund-labels";
import { currentUntil, getRefundCase, isRefundable, untilAfter } from "@/lib/refunds";
import { refundAction, rejectAction, updateInvoiceActionAction } from "../actions";
import { RefundForm, RejectForm } from "./decision-forms";

const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="mt-3 space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-brand-navy">{children}</span>
    </div>
  );
}

const untilText = (d: Date | null) => (d ? untilFormat.format(d) : "—");

/** Admin → Üyelik İadeleri → one purchase: its request, and the refund or rejection. */
export default async function RefundCasePage(props: PageProps<"/admin/iadeler/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const { sonuc } = await props.searchParams;
  const c = await getRefundCase(id);
  if (!c) notFound();

  const refund = c.refund;
  const paid = Number(c.amount);
  const service = purchaseServiceLabel(c.plan, c.months);
  const corp = isCorpPlan(c.plan);
  const until = currentUntil(c);
  const now = new Date();
  const decidedBy = refund?.decidedById
    ? await prisma.user.findUnique({ where: { id: refund.decidedById }, select: { name: true } })
    : null;
  const pdf = c.invoiceNo
    ? await prisma.invoiceFile.findUnique({ where: { kind_recordId: { kind: "uyelik", recordId: c.id } }, select: { id: true } })
    : null;

  // What each membership choice would leave the end date at.
  const preview = Object.fromEntries(
    (Object.keys(MEMBERSHIP_CHANGE_LABEL) as MembershipChange[]).map((k) => {
      if (c.months === null && !corp) {
        return [k, k === "keep" ? "Süresiz Pro devam eder" : "Süresiz Pro kaldırılır"];
      }
      if (!until || until <= now) return [k, "Üyelik zaten bitmiş"];
      const next = untilAfter(k, until, c.months, now);
      if (next?.getTime() === until.getTime()) return [k, `Bitiş ${untilText(until)} (değişmez)`];
      if (next && next <= now) return [k, "Bugün sona erer"];
      return [k, `Bitiş ${untilText(until)} → ${untilText(next)}`];
    })
  ) as Record<MembershipChange, string>;

  const membershipNow = corp
    ? c.user.corpPlan && c.user.corpPlanUntil && c.user.corpPlanUntil > now
      ? `${PURCHASE_PLAN_LABEL[c.user.corpPlan]} · bitiş ${untilText(c.user.corpPlanUntil)}`
      : "Kurumsal paket yok"
    : c.user.proUntil && c.user.proUntil > now
      ? `${c.user.proPlus ? "Pro Plus" : "Pro"} · bitiş ${untilText(c.user.proUntil)}`
      : c.user.isPro
        ? "Süresiz Pro"
        : "Ücretsiz paket";

  const status = refund?.status;
  const canDecide = isRefundable(c) && status !== "REFUNDED";

  return (
    <div className="max-w-5xl">
      <Link href="/admin/iadeler" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Üyelik İadeleri
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-navy">{service}</h1>
        {status === "REQUESTED" && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Talep Bekliyor</span>}
        {status === "REFUNDED" && (
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            {Number(refund?.amount) < paid ? "Kısmi İade Edildi" : "İade Edildi"}
          </span>
        )}
        {status === "REJECTED" && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Reddedildi</span>}
        {!refund && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Talep Yok</span>}
        {c.user.isTester && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Test Hesabı</span>}
      </div>

      {sonuc === "iade" && (
        <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">İade kaydedildi; üyeye e-posta gönderildi.</p>
      )}
      {sonuc === "red" && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Talep reddedildi; üyeye gerekçesiyle e-posta gönderildi.</p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card title="Satın Alma">
          <Line label="Tutar">{formatPrice(paid)} TL</Line>
          <Line label="Ödeme">{PAID_WITH_LABEL[c.provider] ?? c.provider}</Line>
          <Line label="Tarih">{dateTimeFmt.format(c.createdAt)}</Line>
          <Line label="Fatura">
            {c.invoiceNo ? (
              <>
                <span className="font-mono text-xs">{c.invoiceNo}</span>
                {pdf && (
                  <a href={`/panel/faturalarim/pdf/uyelik/${c.id}`} target="_blank" className="ml-2 text-xs font-semibold text-purple-700 hover:underline">
                    PDF
                  </a>
                )}
              </>
            ) : (
              <span className="text-slate-400">Kesilmedi</span>
            )}
          </Line>
          {c.status !== "SUCCESS" && <p className="text-xs text-red-600">Bu satın alma ödenmemiş; iade edilemez.</p>}
        </Card>

        <Card title="Üye">
          <p>
            <Link href={`/admin/kullanicilar/${c.user.id}`} className="font-semibold text-brand-navy hover:text-purple-700">
              {c.user.companyName ?? c.user.name}
            </Link>
          </p>
          {c.user.companyName && <p className="text-slate-500">{c.user.name}</p>}
          <p className="text-slate-500">{c.user.email}</p>
          <Line label="Şu anki paket">{membershipNow}</Line>
        </Card>

        <Card title={refund?.requestedAt ? "Üyenin Talebi" : "Talep"}>
          {refund ? (
            <>
              <Line label="Gerekçe">{REFUND_REASONS[refund.reason as RefundReason] ?? refund.reason}</Line>
              {refund.requestedAt && <Line label="Tarih">{dateTimeFmt.format(refund.requestedAt)}</Line>}
              {refund.note && <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{refund.note}</p>}
              {refund.iban && (
                <div className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-400">İade IBAN&apos;ı</p>
                  <p className="select-all font-mono text-xs font-semibold text-brand-navy">{formatIban(refund.iban)}</p>
                  <p className="text-xs text-slate-500">{refund.ibanHolder}</p>
                </div>
              )}
              {!refund.requestedAt && <p className="text-xs text-slate-400">Admin tarafından talep olmadan başlatıldı.</p>}
            </>
          ) : (
            <p className="text-slate-500">Üye iade talep etmedi. Gerekirse aşağıdan doğrudan iade kaydedebilirsin.</p>
          )}
        </Card>
      </div>

      {status === "REFUNDED" && refund && (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">İade Kaydı</p>
          <div className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            <Line label="İade edilen">{formatPrice(Number(refund.amount))} TL{Number(refund.amount) < paid ? ` / ${formatPrice(paid)} TL` : ""}</Line>
            <Line label="Yöntem">{REFUND_METHOD_LABEL[refund.method as RefundMethod] ?? refund.method}</Line>
            <Line label="Dekont / işlem no"><span className="font-mono text-xs">{refund.reference ?? "—"}</span></Line>
            <Line label="Tarih">{refund.decidedAt ? dateTimeFmt.format(refund.decidedAt) : "—"}{decidedBy ? ` · ${decidedBy.name}` : ""}</Line>
            <Line label="Üyelik bitişi">
              {c.months === null && !corp
                ? "Süresiz Pro"
                : refund.prevUntil?.getTime() === refund.newUntil?.getTime()
                  ? `${untilText(refund.newUntil)} (değişmedi)`
                  : `${untilText(refund.prevUntil)} → ${untilText(refund.newUntil)}`}
            </Line>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Fatura</span>
              {c.invoiceNo ? (
                <form action={updateInvoiceActionAction.bind(null, c.id)} className="flex items-center gap-2">
                  <select
                    name="invoiceAction"
                    defaultValue={refund.invoiceAction ?? "bekliyor"}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                  >
                    {Object.entries(INVOICE_ACTION_LABEL)
                      .filter(([k]) => k !== "kesilmedi")
                      .map(([k, t]) => (
                        <option key={k} value={k}>{t}</option>
                      ))}
                  </select>
                  <button className="text-xs font-semibold text-purple-700 hover:underline">Güncelle</button>
                </form>
              ) : (
                <span className="font-medium text-brand-navy">
                  {INVOICE_ACTION_LABEL[(refund.invoiceAction ?? "kesilmedi") as InvoiceAction]}
                  {Number(refund.amount) < paid && ` · faturayı net ${formatPrice(paid - Number(refund.amount))} TL üzerinden kes`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {status === "REJECTED" && refund && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/50 p-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Red Gerekçesi</p>
          <p className="mt-2 text-slate-700">{refund.rejectReason}</p>
          <p className="mt-1 text-xs text-slate-400">
            {refund.decidedAt && dateTimeFmt.format(refund.decidedAt)}
            {decidedBy ? ` · ${decidedBy.name}` : ""}
          </p>
        </div>
      )}

      {canDecide && (
        <div className={`mt-6 grid gap-4 ${status === "REQUESTED" ? "lg:grid-cols-[1fr_20rem]" : ""}`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-semibold text-brand-navy">{status === "REJECTED" ? "Yine de İade Et" : "İade Et"}</p>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Ödeme {PAID_WITH_LABEL[c.provider] ?? c.provider} ile alındı; iade aynı yolla yapılır (İptal ve İade Koşulları m. 6).
            </p>
            <RefundForm
              action={refundAction.bind(null, c.id)}
              paid={paid}
              defaultMethod={methodForProvider(c.provider)}
              allowBalance={c.provider === "bakiye" || Boolean(c.user.companyName)}
              invoiced={Boolean(c.invoiceNo)}
              needsReason={!refund}
              untilPreview={preview}
            />
          </div>
          {status === "REQUESTED" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="mb-4 font-semibold text-brand-navy">Reddet</p>
              <RejectForm action={rejectAction.bind(null, c.id)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
