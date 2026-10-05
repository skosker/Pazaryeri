import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { listIntermediaryRows, parseDay } from "@/lib/intermediary";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });
const tl = (n: number) => `${formatPrice(n)} TL`;

/**
 * Admin → Aracılık Dökümleri: the service fee Prosinta kept on each completed order and
 * what went to the freelancer, from real on-site orders only, with a printable statement
 * per order and a CSV for the accountant.
 */
export default async function IntermediaryPage(props: PageProps<"/admin/aracilik">) {
  const query = await props.searchParams;
  const bas = typeof query.bas === "string" ? query.bas : "";
  const bit = typeof query.bit === "string" ? query.bit : "";
  const rows = await listIntermediaryRows({ from: parseDay(bas), to: parseDay(bit, true) });

  const sum = (pick: (r: (typeof rows)[number]) => number) => rows.reduce((s, r) => s + pick(r), 0);
  const paidNet = sum((r) => (r.payout.status === "PAID" ? r.net : 0));
  const csvQuery = new URLSearchParams({ ...(bas ? { bas } : {}), ...(bit ? { bit } : {}) }).toString();

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Aracılık Dökümleri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sitede tamamlanan siparişlerde alınan aracılık hizmet bedeli ve freelancer&apos;a ödenen hakediş.
          </p>
        </div>
        <a
          href={`/admin/aracilik/disa-aktar${csvQuery ? `?${csvQuery}` : ""}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          CSV İndir
        </a>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Başlangıç
          <input type="date" name="bas" defaultValue={bas} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Bitiş
          <input type="date" name="bit" defaultValue={bit} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </label>
        <button className="rounded-full bg-brand-navy px-4 py-2 font-semibold text-white">Filtrele</button>
        {(bas || bit) && (
          <Link href="/admin/aracilik" className="py-2 text-xs font-semibold text-slate-500 hover:text-brand-navy">
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Tamamlanan sipariş", rows.length.toLocaleString("tr-TR")],
          ["Sipariş tutarı", tl(sum((r) => r.gross))],
          ["Aracılık hizmet bedeli", tl(sum((r) => r.commission))],
          ["Freelancer'a ödenen", tl(paidNet)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-brand-navy">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Yalnızca kendileri kayıt olmuş alıcı ve freelancer arasındaki, sitede tamamlanmış siparişler. Vitrin profilleri, demo
        hesaplar ve Excel&apos;den aktarılan kayıtlar dahil edilmez; elle kayıt eklenemez.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Bu aralıkta tamamlanmış sipariş yok.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tamamlanma</th>
                <th className="px-4 py-3 font-medium">Sipariş</th>
                <th className="px-4 py-3 font-medium">Freelancer</th>
                <th className="px-4 py-3 text-right font-medium">Sipariş tutarı</th>
                <th className="px-4 py-3 text-right font-medium">Aracılık bedeli</th>
                <th className="px-4 py-3 text-right font-medium">Net hakediş</th>
                <th className="px-4 py-3 font-medium">Ödeme</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.payoutId} className="border-b border-slate-50 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateFmt.format(r.completedAt)}</td>
                  <td className="max-w-[16rem] px-4 py-3">
                    <Link href={`/siparis/${r.orderId}`} className="font-semibold text-brand-navy hover:underline">
                      #{r.orderId.slice(-8)}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{r.service}</p>
                    <p className="text-xs text-slate-400">Alıcı: {r.buyer.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.seller.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">{tl(r.gross)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                    {tl(r.commission)}
                    <span className="block text-[11px] text-slate-400">%{r.commissionPercent.toLocaleString("tr-TR")}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-brand-navy">{tl(r.net)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {r.payout.status === "PAID" ? (
                      <span className="text-emerald-700">
                        Ödendi
                        {r.payout.paidAt && <span className="block text-[11px] text-slate-400">{dateFmt.format(r.payout.paidAt)}</span>}
                      </span>
                    ) : r.payout.status === "FAILED" ? (
                      <span className="text-red-600">Başarısız</span>
                    ) : (
                      <span className="text-amber-700">Bekliyor</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/aracilik/${r.payoutId}`} className="whitespace-nowrap text-xs font-semibold text-purple-700 hover:underline">
                      Döküm →
                    </Link>
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
