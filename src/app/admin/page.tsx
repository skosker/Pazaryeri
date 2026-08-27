import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listPendingBankTransfers } from "@/lib/order-actions";
import { formatPrice } from "@/lib/format-price";
import type { Prisma } from "@/generated/prisma/client";

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

export default async function AdminDashboardPage(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const bas = toSingle(searchParams.bas);
  const bit = toSingle(searchParams.bit);
  const from = parseDate(bas);
  const to = parseDate(bit, true);
  const filtered = Boolean(from || to);

  // When a range is given the whole dashboard reflects that period (rows created in it);
  // with no range every metric is all-time, as before.
  const createdAt: Prisma.DateTimeFilter | undefined = filtered
    ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
    : undefined;
  const inRange = createdAt ? { createdAt } : {};

  const [userCount, freelancerCount, gigCount, orderCount, pending, completedOrders] =
    await Promise.all([
      prisma.user.count({ where: { ...inRange } }),
      prisma.user.count({ where: { role: "FREELANCER", ...inRange } }),
      prisma.gig.count({ where: { ...inRange } }),
      prisma.order.count({ where: { ...inRange } }),
      listPendingBankTransfers(),
      prisma.order.findMany({
        where: { status: "COMPLETED", ...inRange },
        select: { amount: true },
      }),
    ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Genel Bakış</h1>
      <p className="mt-1 text-sm text-slate-500">
        {filtered ? "Seçilen tarih aralığının özeti." : "Platform özeti ve bekleyen işlemler."}
      </p>

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
        {filtered && (
          <Link
            href="/admin"
            className="px-2 py-2 text-sm font-medium text-slate-500 hover:text-brand-navy"
          >
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={filtered ? "Yeni Kullanıcı" : "Kullanıcı"} value={String(userCount)} />
        <StatCard label={filtered ? "Yeni Freelancer" : "Freelancer"} value={String(freelancerCount)} />
        <StatCard label={filtered ? "Yeni İlan" : "İlan"} value={String(gigCount)} />
        <StatCard label="Sipariş" value={String(orderCount)} />
        <StatCard label="Tamamlanan Ciro" value={`${formatPrice(totalRevenue)}₺`} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-navy">
            Onay Bekleyen Havale/EFT Ödemeleri {pending.length > 0 && `(${pending.length})`}
          </h2>
          <Link href="/admin/havale-onaylari" className="text-sm font-semibold text-purple-700 hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            Onay bekleyen havale/EFT bildirimi yok.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {pending.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-navy">{order.gig.title}</p>
                      <p className="text-xs text-slate-400">
                        Sipariş #{order.id.slice(-8).toUpperCase()} · {order.buyer.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-brand-navy">{formatPrice(order.amount)}₺</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/siparis/${order.id}`} className="font-semibold text-purple-700 hover:underline">
                        İncele
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
