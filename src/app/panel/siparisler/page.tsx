import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel, orderStatusColor } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";
import { formatPrice } from "@/lib/format-price";

const statusTabs: { key: OrderStatus | "TUMU"; label: string }[] = [
  { key: "TUMU", label: "Tümü" },
  { key: "PENDING_VERIFICATION", label: "Onay Bekliyor" },
  { key: "IN_PROGRESS", label: "Devam Ediyor" },
  { key: "DELIVERED", label: "Teslim Edildi" },
  { key: "COMPLETED", label: "Tamamlandı" },
  { key: "CANCELLED", label: "İptal" },
];

function buildHref(params: { gorunum?: string; durum?: string }) {
  const search = new URLSearchParams();
  if (params.gorunum) search.set("gorunum", params.gorunum);
  if (params.durum && params.durum !== "TUMU") search.set("durum", params.durum);
  const qs = search.toString();
  return qs ? `/panel/siparisler?${qs}` : "/panel/siparisler";
}

export default async function PanelOrdersPage(props: PageProps<"/panel/siparisler">) {
  const searchParams = await props.searchParams;

  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/siparisler");

  const isFreelancer = session.user.role === "FREELANCER";
  const gorunumParam = typeof searchParams.gorunum === "string" ? searchParams.gorunum : undefined;
  const gorunum: "satici" | "alici" = isFreelancer && gorunumParam === "alici" ? "alici" : isFreelancer ? "satici" : "alici";
  const durumParam = typeof searchParams.durum === "string" ? searchParams.durum : "TUMU";
  const durum = statusTabs.some((t) => t.key === durumParam) ? durumParam : "TUMU";

  const statusFilter = durum !== "TUMU" ? { status: durum as OrderStatus } : {};
  const where =
    gorunum === "satici"
      ? { gig: { sellerId: session.user.id }, ...statusFilter }
      : { buyerId: session.user.id, ...statusFilter };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      gig: { select: { title: true, slug: true, seller: { select: { name: true } } } },
      buyer: { select: { name: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">{isFreelancer ? "Siparişler" : "Siparişlerim"}</h1>
      <p className="mt-1 text-sm text-slate-500">{orders.length} sipariş.</p>

      {isFreelancer && (
        <div className="mt-6 flex gap-2">
          <Link
            href={buildHref({ gorunum: "satici", durum })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              gorunum === "satici" ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Gelen Siparişler
          </Link>
          <Link
            href={buildHref({ gorunum: "alici", durum })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              gorunum === "alici" ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Verdiğim Siparişler
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildHref({ gorunum: isFreelancer ? gorunum : undefined, durum: tab.key })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              durum === tab.key ? "bg-purple-100 text-purple-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
              <th className="px-5 py-3 font-medium">{gorunum === "satici" ? "Alıcı" : "Satıcı"}</th>
              <th className="px-5 py-3 font-medium">Tutar</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  Bu görünümde sipariş yok.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="line-clamp-1 font-medium text-brand-navy">{order.gig.title}</p>
                    <p className="text-xs text-slate-400">Sipariş #{order.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {gorunum === "satici" ? order.buyer.name : order.gig.seller.name}
                  </td>
                  <td className="px-5 py-4 font-semibold text-brand-navy">{formatPrice(order.amount)}₺</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusColor[order.status]}`}>
                      {orderStatusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/siparis/${order.id}`} className="font-semibold text-purple-700 hover:underline">
                      Detay
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
