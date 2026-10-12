import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { formatPrice } from "@/lib/format-price";
import { PAID_WITH_LABEL, purchaseServiceLabel } from "@/lib/invoices";
import { INVOICE_ACTION_LABEL, REFUND_METHOD_LABEL, REFUND_REASONS, type InvoiceAction, type RefundMethod, type RefundReason } from "@/lib/refund-labels";
import { listRefunds, refundStats } from "@/lib/refunds";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" });

const TABS = [
  { key: "bekleyen", label: "Bekleyen Talepler", status: "REQUESTED" },
  { key: "iade-edilen", label: "İade Edilenler", status: "REFUNDED" },
  { key: "reddedilen", label: "Reddedilenler", status: "REJECTED" },
] as const;

function Tile({ title, value, hint, tone = "text-brand-navy" }: { title: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{title}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/** Admin → Üyelik İadeleri: members' refund requests for memberships and corporate plans, and refunds made. */
export default async function RefundsPage(props: PageProps<"/admin/iadeler">) {
  await requireAdmin();
  const { durum } = await props.searchParams;
  const tab = TABS.find((t) => t.key === durum) ?? TABS[0];
  const [rows, stats] = await Promise.all([listRefunds(tab.status), refundStats()]);

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-brand-navy">Üyelik İadeleri</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Pro, Pro Plus ve kurumsal paket iadeleri. Cayma hakkı yoktur; mükerrer ödeme, hatalı tahsilat ya da Platform kaynaklı
        aksaklıkta iade edilir. Talep olmadan iade için Faturalar&apos;daki satırda &quot;İade&quot; bağlantısını kullan.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile title="Bekleyen talep" value={String(stats.requested)} tone={stats.requested > 0 ? "text-amber-600" : "text-brand-navy"} />
        <Tile title="Bu ay iade edilen" value={`${formatPrice(stats.refundedThisMonth)} TL`} hint={`${stats.refundedThisMonthCount} iade`} tone="text-sky-700" />
        <Tile title="Fatura işlemi bekleyen" value={String(stats.invoicePending)} hint="e-Arşiv iptali / iade faturası" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "bekleyen" ? "/admin/iadeler" : `/admin/iadeler?durum=${t.key}`}
            className={`rounded-full px-4 py-1.5 font-semibold ${
              t.key === tab.key ? "bg-brand-navy text-white" : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t.label}
            {t.key === "bekleyen" && stats.requested > 0 ? ` (${stats.requested})` : ""}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          {tab.status === "REQUESTED" ? "Bekleyen iade talebi yok." : "Kayıt yok."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{tab.status === "REQUESTED" ? "Talep" : "Karar"}</th>
                <th className="px-4 py-3 font-medium">Üye</th>
                <th className="px-4 py-3 font-medium">Hizmet</th>
                <th className="px-4 py-3 text-right font-medium">Ödenen</th>
                <th className="px-4 py-3 font-medium">Gerekçe</th>
                <th className="px-4 py-3 font-medium">{tab.status === "REFUNDED" ? "İade" : tab.status === "REJECTED" ? "Red Gerekçesi" : ""}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = r.purchase;
                const paid = Number(p.amount);
                return (
                  <tr key={r.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {dateFmt.format((tab.status === "REQUESTED" ? r.requestedAt ?? r.createdAt : r.decidedAt) ?? r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/kullanicilar/${p.user.id}`} className="font-semibold text-brand-navy hover:text-purple-700">
                        {p.user.companyName ?? p.user.name}
                      </Link>
                      {p.user.isTester && (
                        <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Test</span>
                      )}
                      <p className="text-xs text-slate-400">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {purchaseServiceLabel(p.plan, p.months)}
                      <p className="text-xs text-slate-400">{dateFmt.format(p.createdAt)} · {PAID_WITH_LABEL[p.provider] ?? p.provider}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-brand-navy">{formatPrice(paid)} TL</td>
                    <td className="px-4 py-3 text-slate-600">{REFUND_REASONS[r.reason as RefundReason] ?? r.reason}</td>
                    <td className="px-4 py-3">
                      {r.status === "REFUNDED" && (
                        <>
                          <p className="font-semibold text-sky-700">
                            {formatPrice(Number(r.amount))} TL{Number(r.amount) < paid ? " (kısmi)" : ""}
                          </p>
                          <p className="text-xs text-slate-500">{REFUND_METHOD_LABEL[r.method as RefundMethod] ?? r.method}</p>
                          {r.invoiceAction === "bekliyor" ? (
                            <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Fatura işlemi bekliyor</span>
                          ) : (
                            r.invoiceAction && <p className="text-[11px] text-slate-400">{INVOICE_ACTION_LABEL[r.invoiceAction as InvoiceAction]}</p>
                          )}
                        </>
                      )}
                      {r.status === "REJECTED" && <p className="max-w-xs text-xs text-slate-500">{r.rejectReason}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/iadeler/${p.id}`} className="whitespace-nowrap text-sm font-semibold text-purple-700 hover:underline">
                        {r.status === "REQUESTED" ? "İncele →" : "Detay →"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
