import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel, orderStatusColor } from "@/lib/order-status";

export default async function PanelPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel");

  const { id: userId, role } = session.user;

  const [myGigs, ordersAsBuyer, ordersAsSeller] = await Promise.all([
    role === "FREELANCER"
      ? prisma.gig.findMany({
          where: { sellerId: userId },
          include: { packages: { orderBy: { price: "asc" }, take: 1 } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { gig: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    role === "FREELANCER"
      ? prisma.order.findMany({
          where: { gig: { sellerId: userId } },
          include: { gig: { select: { title: true, slug: true } }, buyer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Merhaba, {session.user.name}</h1>
          <p className="text-sm text-slate-500">
            {role === "FREELANCER" ? "Freelancer paneli" : "Alıcı paneli"}
          </p>
        </div>
      </div>

      {role === "FREELANCER" && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-navy">İlanlarım</h2>
            <Link
              href="/panel/ilan-olustur"
              className="brand-gradient rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Yeni İlan Oluştur
            </Link>
          </div>

          {myGigs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
              Henüz bir ilanın yok. Hemen ilk hizmetini oluştur.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myGigs.map((gig) => (
                <Link
                  key={gig.id}
                  href={`/gig/${gig.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm"
                >
                  <p className="line-clamp-2 font-medium text-brand-navy">{gig.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Başlangıç{" "}
                    <span className="font-semibold text-brand-navy">
                      {gig.packages[0] ? Number(gig.packages[0].price) : 0}₺
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {role === "FREELANCER" && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-brand-navy">Gelen Siparişler</h2>
          {ordersAsSeller.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
              Henüz sipariş almadın.
            </p>
          ) : (
            <OrderTable
              rows={ordersAsSeller.map((o) => ({
                id: o.id,
                title: o.gig.title,
                subtitle: o.buyer.name,
                amount: Number(o.amount),
                status: o.status,
              }))}
            />
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-navy">Siparişlerim</h2>
        {ordersAsBuyer.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Henüz bir sipariş vermedin.{" "}
            <Link href="/kategoriler" className="font-semibold text-purple-700 hover:underline">
              Hizmetlere göz at
            </Link>
          </p>
        ) : (
          <OrderTable
            rows={ordersAsBuyer.map((o) => ({
              id: o.id,
              title: o.gig.title,
              subtitle: null,
              amount: Number(o.amount),
              status: o.status,
            }))}
          />
        )}
      </section>
    </div>
  );
}

function OrderTable({
  rows,
}: {
  rows: { id: string; title: string; subtitle: string | null; amount: number; status: keyof typeof orderStatusLabel }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-4">
                <p className="font-medium text-brand-navy">{row.title}</p>
                {row.subtitle && <p className="text-xs text-slate-400">{row.subtitle}</p>}
              </td>
              <td className="px-5 py-4 font-semibold text-brand-navy">{row.amount}₺</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusColor[row.status]}`}>
                  {orderStatusLabel[row.status]}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <Link href={`/siparis/${row.id}`} className="font-semibold text-purple-700 hover:underline">
                  Detay
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
