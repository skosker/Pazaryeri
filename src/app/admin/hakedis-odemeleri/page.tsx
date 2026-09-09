import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { maskIban } from "@/lib/iban";
import { formatPrice } from "@/lib/format-price";
import type { Prisma } from "@/generated/prisma/client";
import { ImportPayoutsForm } from "./import-form";
import { PayoutByFreelancerChart } from "./payout-chart";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dayLabelFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", weekday: "short" });

// Fixed reporting window for the day-by-day breakdown below — independent of the
// Başlangıç/Bitiş filter above, which narrows the payments *table* instead.
const DAILY_BREAKDOWN_START = new Date("2026-08-19T00:00:00");
const DAILY_BREAKDOWN_END = new Date("2026-09-09T23:59:59.999");

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
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

export default async function FreelancerPayoutsPage(props: PageProps<"/admin/hakedis-odemeleri">) {
  const searchParams = await props.searchParams;
  const bas = toSingle(searchParams.bas);
  const bit = toSingle(searchParams.bit);
  const from = parseDate(bas);
  const to = parseDate(bit, true);

  const paidAt: Prisma.DateTimeFilter | undefined =
    from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined;

  const list = await prisma.freelancerPayout.findMany({
    where: paidAt ? { paidAt } : {},
    orderBy: [{ paidAt: "desc" }, { name: "asc" }],
  });
  const total = list.reduce((sum, p) => sum + Number(p.amount), 0);

  const windowPayouts = await prisma.freelancerPayout.findMany({
    where: { paidAt: { gte: DAILY_BREAKDOWN_START, lte: DAILY_BREAKDOWN_END } },
    select: { paidAt: true, amount: true },
  });
  const byDay = new Map<string, { count: number; total: number }>();
  for (const p of windowPayouts) {
    const key = dayKey(p.paidAt);
    const entry = byDay.get(key) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(p.amount);
    byDay.set(key, entry);
  }
  const dailyBreakdown: { date: Date; count: number; total: number }[] = [];
  for (
    let d = new Date(DAILY_BREAKDOWN_START);
    d <= DAILY_BREAKDOWN_END;
    d.setDate(d.getDate() + 1)
  ) {
    const date = new Date(d);
    const entry = byDay.get(dayKey(date)) ?? { count: 0, total: 0 };
    dailyBreakdown.push({ date, ...entry });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Hakediş Ödemeleri</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Freelancer&apos;lara yapılan hakediş ödemeleri. Yalnızca admin panelinde görünür.
      </p>

      <div className="mt-6">
        <ImportPayoutsForm />
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
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
        <button
          type="submit"
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Filtrele
        </button>
        {(bas || bit) && (
          <Link href="/admin/hakedis-odemeleri" className="px-2 py-2 text-sm font-medium text-slate-500 hover:text-brand-navy">
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-xl bg-emerald-50 px-4 py-2 text-emerald-800">
          Toplam ödenen: <strong>{formatPrice(total)}₺</strong>
        </span>
      </div>

      <PayoutByFreelancerChart payments={list.map((p) => ({ name: p.name, amount: Number(p.amount) }))} />

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Günlük Ödemeler — 19 Ağustos – 9 Eylül 2026
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Bilgi amaçlıdır; yukarıdaki tarih filtresinden bağımsızdır.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium">Ödeme Sayısı</th>
                <th className="px-5 py-3 font-medium text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdown.map((day) => (
                <tr
                  key={dayKey(day.date)}
                  className={`border-b border-slate-100 last:border-0 ${day.count === 0 ? "text-slate-300" : ""}`}
                >
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    {dayLabelFmt.format(day.date)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{day.count}</td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                    {day.total > 0 ? `${formatPrice(day.total)}₺` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Hesap Sahibi</th>
              <th className="px-5 py-3 font-medium">IBAN</th>
              <th className="px-5 py-3 font-medium">Tutar</th>
              <th className="px-5 py-3 font-medium text-right">Ödeme Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4 font-medium text-brand-navy">{row.name}</td>
                <td className="px-5 py-4 font-mono text-xs text-slate-600 sm:text-sm">
                  {maskIban(row.iban)}
                </td>
                <td className="px-5 py-4 font-semibold text-brand-navy">{formatPrice(row.amount)}₺</td>
                <td className="px-5 py-4 text-right text-slate-500">{dateFmt.format(row.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
