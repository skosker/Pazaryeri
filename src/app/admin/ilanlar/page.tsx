import { prisma } from "@/lib/prisma";
import { togglePublishedAction, deleteGigAction } from "./actions";
import { formatPrice } from "@/lib/format-price";

export default async function AdminGigsPage() {
  const gigs = await prisma.gig.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true } },
      category: { select: { name: true } },
      packages: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">İlanlar</h1>
      <p className="mt-1 text-sm text-slate-500">{gigs.length} ilan.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">İlan</th>
              <th className="px-5 py-3 font-medium">Satıcı</th>
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
                <td className="px-5 py-4 text-slate-600">{gig.seller.name}</td>
                <td className="px-5 py-4 text-slate-500">{gig.category.name}</td>
                <td className="px-5 py-4 font-semibold text-brand-navy">
                  {formatPrice(gig.packages[0]?.price ?? 0)}₺
                </td>
                <td className="px-5 py-4">
                  {gig.published ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Kaldırıldı
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <form action={togglePublishedAction.bind(null, gig.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {gig.published ? "Yayından Kaldır" : "Yayına Al"}
                      </button>
                    </form>
                    {gig._count.orders === 0 && (
                      <form action={deleteGigAction.bind(null, gig.id)}>
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
    </div>
  );
}
