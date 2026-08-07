import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toggleMyGigPublishedAction, deleteMyGigAction } from "./actions";

export default async function MyGigsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/ilanlarim");
  if (session.user.role !== "FREELANCER") redirect("/panel");

  const gigs = await prisma.gig.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      packages: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">İlanlarım</h1>
          <p className="mt-1 text-sm text-slate-500">{gigs.length} ilan.</p>
        </div>
        <Link
          href="/panel/ilan-olustur"
          className="brand-gradient rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Yeni İlan Oluştur
        </Link>
      </div>

      {gigs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Henüz bir ilanın yok. Hemen ilk hizmetini oluştur.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">İlan</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Fiyat</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {gigs.map((gig) => (
                <tr key={gig.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="line-clamp-1 font-medium text-brand-navy">{gig.title}</p>
                    <p className="text-xs text-slate-400">{gig._count.orders} sipariş</p>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{gig.category.name}</td>
                  <td className="px-5 py-4 font-semibold text-brand-navy">
                    {gig.packages[0] ? Number(gig.packages[0].price) : 0}₺
                  </td>
                  <td className="px-5 py-4">
                    {gig.published ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Yayında
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        Duraklatıldı
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/panel/ilanlarim/${gig.id}/duzenle`}
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Düzenle
                      </Link>
                      <form action={toggleMyGigPublishedAction.bind(null, gig.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          {gig.published ? "Duraklat" : "Yayına Al"}
                        </button>
                      </form>
                      {gig._count.orders === 0 && (
                        <form action={deleteMyGigAction.bind(null, gig.id)}>
                          <button
                            type="submit"
                            className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Sil
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
