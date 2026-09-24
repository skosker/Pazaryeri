import { prisma } from "@/lib/prisma";
import {
  togglePublishedAction,
  deleteGigAction,
  approveGigAction,
  rejectGigAction,
  toggleFeaturedAction,
} from "./actions";
import { formatPrice } from "@/lib/format-price";
import { getCategoryPriceComparison } from "@/lib/price-stats";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * The generated showcase sellers' gigs outnumber real listings by a wide margin (see
 * the same note on /admin/kullanicilar) — an unfiltered, unbounded query here loaded
 * every one of them into a single table on each request. ?uretilmis=1 still includes
 * them for the rare case where one needs looking at.
 */
export default async function AdminGigsPage(props: PageProps<"/admin/ilanlar">) {
  const searchParams = await props.searchParams;
  const showGenerated =
    (Array.isArray(searchParams.uretilmis) ? searchParams.uretilmis[0] : searchParams.uretilmis) === "1";

  const gigs = await prisma.gig.findMany({
    where: showGenerated ? {} : { seller: { synthetic: false } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      seller: { select: { name: true } },
      category: { select: { name: true } },
      packages: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { orders: true } },
    },
  });

  const pendingGigs = await prisma.gig.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      seller: { select: { name: true, email: true } },
      category: { select: { name: true } },
      packages: { orderBy: { price: "asc" }, take: 1 },
    },
  });

  const categoryStats = await getCategoryPriceComparison();
  const overallAvg =
    categoryStats.length > 0
      ? categoryStats.reduce((sum, row) => sum + row.avgPrice * row.gigCount, 0) /
        categoryStats.reduce((sum, row) => sum + row.gigCount, 0)
      : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">İlanlar</h1>
      <p className="mt-1 text-sm text-slate-500">{gigs.length} ilan.</p>

      {pendingGigs.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-bold text-brand-navy">
            Onay Bekleyen İlanlar ({pendingGigs.length})
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">İlan</th>
                  <th className="px-5 py-3 font-medium">Satıcı</th>
                  <th className="px-5 py-3 font-medium">Kategori</th>
                  <th className="px-5 py-3 font-medium">Fiyat</th>
                  <th className="px-5 py-3 font-medium">Gönderim Tarihi</th>
                  <th className="px-5 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pendingGigs.map((gig) => (
                  <tr key={gig.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <a
                        href={`/gig/${gig.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 font-medium text-brand-navy hover:underline"
                      >
                        {gig.title}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {gig.seller.name}
                      <p className="text-xs text-slate-400">{gig.seller.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{gig.category.name}</td>
                    <td className="px-5 py-4 font-semibold text-brand-navy">
                      {formatPrice(gig.packages[0]?.price ?? 0)} TL
                    </td>
                    <td className="px-5 py-4 text-slate-500">{dateFmt.format(gig.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <form action={approveGigAction.bind(null, gig.id)}>
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Onayla
                          </button>
                        </form>
                        <form action={rejectGigAction.bind(null, gig.id)}>
                          <button
                            type="submit"
                            className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Reddet
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="mt-10 text-lg font-bold text-brand-navy">Kategorilere Göre Fiyat Karşılaştırması</h2>
      <p className="mt-1 text-sm text-slate-500">
        Her ilanın en ucuz paket fiyatı üzerinden, kategoriye göre karşılaştırma. Üretilmiş
        gösterim ilanları da dahildir.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium text-right">İlan Sayısı</th>
              <th className="px-5 py-3 font-medium text-right">En Düşük</th>
              <th className="px-5 py-3 font-medium text-right">Ortalama</th>
              <th className="px-5 py-3 font-medium text-right">En Yüksek</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-slate-50 font-semibold text-brand-navy">
              <td className="px-5 py-3">Genel Ortalama</td>
              <td className="px-5 py-3 text-right">
                {categoryStats.reduce((sum, row) => sum + row.gigCount, 0)}
              </td>
              <td className="px-5 py-3 text-right text-slate-400">—</td>
              <td className="px-5 py-3 text-right">{formatPrice(overallAvg)} TL</td>
              <td className="px-5 py-3 text-right text-slate-400">—</td>
            </tr>
            {categoryStats.map((row) => (
              <tr key={row.categoryId} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-3 text-brand-navy">{row.categoryName}</td>
                <td className="px-5 py-3 text-right text-slate-500">{row.gigCount}</td>
                <td className="px-5 py-3 text-right text-slate-500">{formatPrice(row.minPrice)} TL</td>
                <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                  {formatPrice(row.avgPrice)} TL
                </td>
                <td className="px-5 py-3 text-right text-slate-500">{formatPrice(row.maxPrice)} TL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-bold text-brand-navy">İlan Listesi</h2>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
                  <p className="line-clamp-1 font-medium text-brand-navy">
                    {gig.featured && <span title="Editör Seçkisi">✦ </span>}
                    {gig.title}
                  </p>
                  {gig._count.orders > 0 && (
                    <p className="text-xs text-slate-400">{gig._count.orders} sipariş</p>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600">{gig.seller.name}</td>
                <td className="px-5 py-4 text-slate-500">{gig.category.name}</td>
                <td className="px-5 py-4 font-semibold text-brand-navy">
                  {formatPrice(gig.packages[0]?.price ?? 0)} TL
                </td>
                <td className="px-5 py-4">
                  {gig.status === "PENDING" ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Onay Bekliyor
                    </span>
                  ) : gig.status === "REJECTED" ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      Reddedildi
                    </span>
                  ) : gig.published ? (
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
                    <form action={toggleFeaturedAction.bind(null, gig.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {gig.featured ? "Seçkiden Kaldır" : "Öne Çıkar"}
                      </button>
                    </form>
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
