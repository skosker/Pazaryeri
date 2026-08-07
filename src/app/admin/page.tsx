import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listPendingBankTransfers } from "@/lib/order-actions";

export default async function AdminDashboardPage() {
  const [userCount, freelancerCount, gigCount, orderCount, pending, completedOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "FREELANCER" } }),
      prisma.gig.count(),
      prisma.order.count(),
      listPendingBankTransfers(),
      prisma.order.findMany({ where: { status: "COMPLETED" }, select: { amount: true } }),
    ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Genel Bakış</h1>
      <p className="mt-1 text-sm text-slate-500">Platform özeti ve bekleyen işlemler.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Kullanıcı" value={String(userCount)} />
        <StatCard label="Freelancer" value={String(freelancerCount)} />
        <StatCard label="İlan" value={String(gigCount)} />
        <StatCard label="Sipariş" value={String(orderCount)} />
        <StatCard label="Tamamlanan Ciro" value={`${totalRevenue}₺`} />
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
                    <td className="px-5 py-4 font-semibold text-brand-navy">{Number(order.amount)}₺</td>
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
