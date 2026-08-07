import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

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

export default async function AdminOrdersPage(props: PageProps<"/admin/siparisler">) {
  const searchParams = await props.searchParams;
  const durum = typeof searchParams.durum === "string" ? searchParams.durum : "TUMU";
  const activeStatus = tabs.some((t) => t.key === durum) ? durum : "TUMU";

  const orders = await prisma.order.findMany({
    where: activeStatus === "TUMU" ? undefined : { status: activeStatus as OrderStatus },
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
      <p className="mt-1 text-sm text-slate-500">{orders.length} sipariş gösteriliyor.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "TUMU" ? "/admin/siparisler" : `/admin/siparisler?durum=${tab.key}`}
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
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  Bu durumda sipariş yok.
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
                  <td className="px-5 py-4 text-slate-600">{order.buyer.name}</td>
                  <td className="px-5 py-4 text-slate-600">{order.gig.seller.name}</td>
                  <td className="px-5 py-4 font-semibold text-brand-navy">
                    {Number(order.amount)}₺
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
