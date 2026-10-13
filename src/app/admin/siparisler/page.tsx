import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format-price";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

const statusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Ödeme Bekliyor",
  PENDING_VERIFICATION: "Havale Onayı Bekliyor",
  PAID: "Ödendi",
  IN_PROGRESS: "Devam Ediyor",
  DELIVERED: "Teslim Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const statusStyle: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-slate-100 text-slate-500",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700",
  PAID: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const tabs: { key: OrderStatus | "TUMU"; label: string }[] = [
  { key: "TUMU", label: "Tümü" },
  { key: "PENDING_VERIFICATION", label: "Havale Onayı Bekliyor" },
  { key: "IN_PROGRESS", label: "Devam Ediyor" },
  { key: "DELIVERED", label: "Teslim Edildi" },
  { key: "COMPLETED", label: "Tamamlandı" },
  { key: "CANCELLED", label: "İptal Edildi" },
];

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
/** "2026-10-12" read as that day in Istanbul; anything else → null. */
const istanbulDay = (v: string, end: boolean) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T${end ? "23:59:59.999" : "00:00:00"}+03:00`) : null;

export default async function AdminOrdersPage(props: PageProps<"/admin/siparisler">) {
  const searchParams = await props.searchParams;
  const durum = typeof searchParams.durum === "string" ? searchParams.durum : "TUMU";
  const activeStatus = tabs.some((t) => t.key === durum) ? durum : "TUMU";
  const alici = one(searchParams.alici);
  const bas = one(searchParams.bas);
  const bit = one(searchParams.bit);
  const from = istanbulDay(bas, false);
  const to = istanbulDay(bit, true);
  const filtered = Boolean(alici || from || to);
  // Tab links keep the buyer and date filters.
  const tabHref = (key: string) => {
    const q = new URLSearchParams();
    if (key !== "TUMU") q.set("durum", key);
    if (alici) q.set("alici", alici);
    if (from) q.set("bas", bas);
    if (to) q.set("bit", bit);
    const qs = q.toString();
    return qs ? `/admin/siparisler?${qs}` : "/admin/siparisler";
  };

  const orders = await prisma.order.findMany({
    // Showcase buyers' orders (seeded for the public review history) are not real
    // business and would bury real orders in this newest-first list.
    where: {
      buyer: { synthetic: false, ...(alici ? { name: { contains: alici, mode: "insensitive" as const } } : {}) },
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(activeStatus === "TUMU" ? {} : { status: activeStatus as OrderStatus }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      buyer: { select: { name: true } },
      gig: { select: { title: true, seller: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Siparişler</h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        {activeStatus !== "TUMU" && <input type="hidden" name="durum" value={activeStatus} />}
        <div>
          <label htmlFor="alici" className="mb-1 block text-xs font-medium text-slate-500">Alıcı Adı</label>
          <input
            id="alici"
            name="alici"
            defaultValue={alici}
            placeholder="Alıcı adına göre ara…"
            className="w-56 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label htmlFor="bas" className="mb-1 block text-xs font-medium text-slate-500">Başlangıç Tarihi</label>
          <input id="bas" name="bas" type="date" defaultValue={bas} className="rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label htmlFor="bit" className="mb-1 block text-xs font-medium text-slate-500">Bitiş Tarihi</label>
          <input id="bit" name="bit" type="date" defaultValue={bit} className="rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-purple-400" />
        </div>
        <button type="submit" className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700">
          Filtrele
        </button>
        {filtered && (
          <Link href={tabHref(activeStatus).split("?")[0] + (activeStatus !== "TUMU" ? `?durum=${activeStatus}` : "")} className="pb-2 text-sm font-medium text-slate-500 hover:text-brand-navy">
            Temizle
          </Link>
        )}
        <span className="ml-auto pb-2 text-sm text-slate-400">{orders.length} sipariş{orders.length === 100 ? " (en yeni 100)" : ""}</span>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tabHref(tab.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              activeStatus === tab.key
                ? "bg-brand-navy text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Sipariş</th>
              <th className="px-5 py-3 font-medium">Tarih</th>
              <th className="px-5 py-3 font-medium">Alıcı</th>
              <th className="px-5 py-3 font-medium">Satıcı</th>
              <th className="px-5 py-3 font-medium">Tutar</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                  {filtered ? "Bu filtreyle sipariş bulunamadı." : "Bu durumda sipariş yok."}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="line-clamp-1 font-medium text-brand-navy">{order.gig.title}</p>
                    <p className="text-xs text-slate-400">
                      Sipariş #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{dateFmt.format(order.createdAt)}</td>
                  <td className="px-5 py-4 text-slate-600">{order.buyer.name}</td>
                  <td className="px-5 py-4 text-slate-600">{order.gig.seller.name}</td>
                  <td className="px-5 py-4 font-semibold text-brand-navy">
                    {formatPrice(order.amount)} TL
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/siparis/${order.id}`}
                      className="font-semibold text-purple-700 hover:underline"
                    >
                      İncele
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
