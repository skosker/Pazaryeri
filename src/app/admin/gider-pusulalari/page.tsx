import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { parseDay } from "@/lib/intermediary";
import { VOUCHER_SERIES, listVouchers, voucherNumberLabel } from "@/lib/expense-voucher";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });
const tl = (n: number) => `${formatPrice(n)} TL`;

/**
 * Admin → Gider Pusulaları: what Prosinta bought for itself from people who are not
 * taxpayers, with gap-free sıra numbers, the withholding to declare, and a CSV for the
 * accountant. Cancelled vouchers stay listed but count nowhere.
 */
export default async function ExpenseVouchersPage(props: PageProps<"/admin/gider-pusulalari">) {
  const query = await props.searchParams;
  const bas = typeof query.bas === "string" ? query.bas : "";
  const bit = typeof query.bit === "string" ? query.bit : "";
  const rows = await listVouchers({ from: parseDay(bas), to: parseDay(bit, true) });
  const valid = rows.filter((r) => !r.cancelledAt);
  const sum = (pick: (r: (typeof rows)[number]) => number) => valid.reduce((s, r) => s + pick(r), 0);
  const csvQuery = new URLSearchParams({ ...(bas ? { bas } : {}), ...(bit ? { bit } : {}) }).toString();

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Gider Pusulaları</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prosinta&apos;nın kendi ihtiyacı için vergi mükellefi olmayan kişilerden aldığı işler (VUK m. 234).
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/admin/gider-pusulalari/disa-aktar${csvQuery ? `?${csvQuery}` : ""}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            CSV İndir
          </a>
          <Link
            href="/admin/gider-pusulalari/yeni"
            className="brand-gradient rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Yeni Gider Pusulası
          </Link>
        </div>
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
          <Link href="/admin/gider-pusulalari" className="py-2 text-xs font-semibold text-slate-500 hover:text-brand-navy">
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Gider pusulası", valid.length.toLocaleString("tr-TR")],
          ["Brüt tutar", tl(sum((r) => r.gross))],
          ["Kesilen stopaj", tl(sum((r) => r.withholding))],
          ["Ödenen net", tl(sum((r) => r.net))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-brand-navy">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        İptal edilenler toplamlara girmez. Kesilen stopaj muhtasar ve prim hizmet beyannamesiyle beyan edilir.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Bu aralıkta gider pusulası yok.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Sıra No</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">İşi Yapan</th>
                <th className="px-4 py-3 text-right font-medium">Brüt</th>
                <th className="px-4 py-3 text-right font-medium">Stopaj</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-b border-slate-50 align-top last:border-0 ${r.cancelledAt ? "opacity-50" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-brand-navy">
                    {VOUCHER_SERIES} {voucherNumberLabel(r.number)}
                    {r.cancelledAt && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 font-sans text-[11px] font-semibold text-red-600">İptal</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {dateFmt.format(r.issuedAt)}
                    <span className="block text-[11px] text-slate-400">kayıt: {dateFmt.format(r.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{r.payeeName}</p>
                    <p className="max-w-xs truncate text-xs text-slate-500">{r.items.map((i) => i.description).join(", ")}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">{tl(r.gross)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                    {tl(r.withholding)}
                    <span className="block text-[11px] text-slate-400">%{r.withholdingPercent.toLocaleString("tr-TR")}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-brand-navy">{tl(r.net)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/gider-pusulalari/${r.id}`} className="whitespace-nowrap text-xs font-semibold text-purple-700 hover:underline">
                      Görüntüle →
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
