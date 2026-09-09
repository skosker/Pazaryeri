import Link from "next/link";
import { listBankTransfers } from "@/lib/order-actions";
import { formatPrice } from "@/lib/format-price";
import { ImportTransfersForm } from "./import-form";
import { PeriodBreakdown, type PeriodRow } from "./period-breakdown";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dayLabelFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
const monthLabelFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });

// The daily/haftalık/aylık breakdown always starts here, independent of the
// Başlangıç/Bitiş filter above (which narrows the table further down instead), and runs
// through today.
const REPORT_START = new Date("2026-08-01T00:00:00Z");

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function atMidnight(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Which 7-day bucket `d` falls into, counting from `reportStart` — not calendar weeks,
 * so the first bucket always starts on reportStart itself (1 Ağustos) instead of
 * whatever Monday precedes it, which could land in July. */
function weekIndexSince(d: Date, reportStart: Date) {
  return Math.floor((atMidnight(d) - atMidnight(reportStart)) / (MS_PER_DAY * 7));
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildBreakdown<T extends { createdAt: Date; amount: unknown }>(
  rows: T[],
  start: Date,
  end: Date
): { gunluk: PeriodRow[]; haftalik: PeriodRow[]; aylik: PeriodRow[] } {
  const byDay = new Map<string, { count: number; total: number }>();
  const byWeek = new Map<number, { count: number; total: number }>();
  const byMonth = new Map<string, { start: Date; count: number; total: number }>();

  for (const row of rows) {
    const amount = Number(row.amount);

    const dKey = dayKey(row.createdAt);
    const dEntry = byDay.get(dKey) ?? { count: 0, total: 0 };
    dEntry.count += 1;
    dEntry.total += amount;
    byDay.set(dKey, dEntry);

    const wIndex = weekIndexSince(row.createdAt, start);
    const wEntry = byWeek.get(wIndex) ?? { count: 0, total: 0 };
    wEntry.count += 1;
    wEntry.total += amount;
    byWeek.set(wIndex, wEntry);

    const mKey = monthKey(row.createdAt);
    const monthStart = new Date(Date.UTC(row.createdAt.getUTCFullYear(), row.createdAt.getUTCMonth(), 1));
    const mEntry = byMonth.get(mKey) ?? { start: monthStart, count: 0, total: 0 };
    mEntry.count += 1;
    mEntry.total += amount;
    byMonth.set(mKey, mEntry);
  }

  const gunluk: PeriodRow[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const entry = byDay.get(dayKey(d)) ?? { count: 0, total: 0 };
    gunluk.push({ label: dayLabelFmt.format(d), ...entry });
  }

  const haftalik: PeriodRow[] = [];
  for (let weekStart = new Date(start); weekStart <= end; weekStart.setUTCDate(weekStart.getUTCDate() + 7)) {
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const entry = byWeek.get(weekIndexSince(weekStart, start)) ?? { count: 0, total: 0 };
    haftalik.push({ label: `${dayLabelFmt.format(weekStart)} – ${dayLabelFmt.format(weekEnd)}`, ...entry });
  }

  const aylik: PeriodRow[] = [];
  for (
    let m = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    m <= end;
    m.setUTCMonth(m.getUTCMonth() + 1)
  ) {
    const entry = byMonth.get(monthKey(m)) ?? { count: 0, total: 0 };
    aylik.push({ label: monthLabelFmt.format(m), ...entry });
  }

  return { gunluk, haftalik, aylik };
}

function toSingle(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

/** "gg/aa/yyyy" (veya nokta) → Date; boş/geçersizde undefined. `end` günün sonuna çeker. */
function parseDate(value: string, end = false): Date | undefined {
  const m = value.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${end ? "23:59:59.999" : "00:00:00"}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const APPROVED = new Set(["PAID", "IN_PROGRESS", "DELIVERED", "COMPLETED"]);

export default async function BankTransferApprovalsPage(
  props: PageProps<"/admin/havale-onaylari">
) {
  const searchParams = await props.searchParams;
  const bas = toSingle(searchParams.bas);
  const bit = toSingle(searchParams.bit);
  const durum = toSingle(searchParams.durum);
  const from = parseDate(bas);
  const to = parseDate(bit, true);

  const allTransfers = await listBankTransfers({ from, to });
  const pendingCount = allTransfers.filter((o) => o.status === "PENDING_VERIFICATION").length;
  const transfers =
    durum === "onaylandi"
      ? allTransfers.filter((o) => APPROVED.has(o.status))
      : durum === "incelenecek"
        ? allTransfers.filter((o) => !APPROVED.has(o.status))
        : allTransfers;

  const now = new Date();
  // No `to: now` here on purpose: a row's time-of-day is a synthetic offset, not a real
  // event time, so a transfer recorded "later today" than the current instant is still
  // today's data — an upper bound on the exact moment would clip it out of today's row.
  const reportRows = await listBankTransfers({ from: REPORT_START });
  const approvedCount = reportRows.filter((o) => APPROVED.has(o.status)).length;
  const reportTotal = reportRows.reduce((sum, o) => sum + Number(o.amount), 0);
  const breakdown = buildBreakdown(reportRows, REPORT_START, now);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Havale/EFT Onayları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tüm havale/EFT bildirimleri.{" "}
        {pendingCount > 0
          ? `${pendingCount} tanesi onay bekliyor.`
          : "Onay bekleyen kayıt yok."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Toplam Sipariş" value={String(reportRows.length)} />
        <StatCard label="Onaylanan Havale" value={String(approvedCount)} />
        <StatCard label="Onay Bekleyen" value={String(reportRows.length - approvedCount)} />
        <StatCard label="Toplam Tutar" value={`${formatPrice(reportTotal)}₺`} />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        1 Ağustos 2026&apos;dan bugüne, aşağıdaki tarih filtresinden bağımsız.
      </p>

      <div className="mt-6">
        <PeriodBreakdown {...breakdown} />
      </div>

      <form method="get" className="mt-10 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Başlangıç</label>
          <input
            type="text"
            inputMode="numeric"
            name="bas"
            defaultValue={bas}
            placeholder="gg/aa/yyyy"
            className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Bitiş</label>
          <input
            type="text"
            inputMode="numeric"
            name="bit"
            defaultValue={bit}
            placeholder="gg/aa/yyyy"
            className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Durum</label>
          <select
            name="durum"
            defaultValue={durum}
            className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
          >
            <option value="">Tümü</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="incelenecek">İncelenecek</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Filtrele
        </button>
        {(bas || bit || durum) && (
          <Link
            href="/admin/havale-onaylari"
            className="px-2 py-2 text-sm font-medium text-slate-500 hover:text-brand-navy"
          >
            Temizle
          </Link>
        )}
        <span className="ml-auto self-center text-sm text-slate-400">{transfers.length} kayıt</span>
      </form>

      <div className="mt-6">
        {transfers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Seçilen aralıkta havale/EFT kaydı yok.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Alıcı</th>
                  <th className="px-5 py-3 font-medium">Satıcı</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium text-right">Durum</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((order) => {
                  const approved = APPROVED.has(order.status);
                  return (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-4 text-slate-500">{dateFmt.format(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-brand-navy">{order.gig.title}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{order.buyer.name}</td>
                      <td className="px-5 py-4 text-slate-600">{order.gig.seller.name}</td>
                      <td className="px-5 py-4 font-semibold text-brand-navy">
                        {formatPrice(order.amount)}₺
                      </td>
                      <td className="px-5 py-4 text-right">
                        {approved ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Onaylandı
                          </span>
                        ) : (
                          <Link
                            href={`/siparis/${order.id}`}
                            className="font-semibold text-purple-700 hover:underline"
                          >
                            İncele ve Onayla
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10">
        <ImportTransfersForm />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-brand-navy">{value}</p>
    </div>
  );
}
