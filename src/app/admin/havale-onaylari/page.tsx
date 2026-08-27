import Link from "next/link";
import { listBankTransfers } from "@/lib/order-actions";
import { formatPrice } from "@/lib/format-price";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

function toSingle(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

/** "YYYY-MM-DD" → Date, or undefined when empty/invalid. `end` pushes to the day's end. */
function parseDate(value: string, end = false): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const APPROVED = new Set(["PAID", "IN_PROGRESS", "DELIVERED", "COMPLETED"]);

export default async function BankTransferApprovalsPage(
  props: PageProps<"/admin/havale-onaylari">
) {
  const searchParams = await props.searchParams;
  const bas = toSingle(searchParams.bas);
  const bit = toSingle(searchParams.bit);
  const from = parseDate(bas);
  const to = parseDate(bit, true);

  const transfers = await listBankTransfers({ from, to });
  const pendingCount = transfers.filter((o) => o.status === "PENDING_VERIFICATION").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Havale/EFT Onayları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tüm havale/EFT bildirimleri.{" "}
        {pendingCount > 0
          ? `${pendingCount} tanesi onay bekliyor.`
          : "Onay bekleyen kayıt yok."}
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Başlangıç</label>
          <input
            type="date"
            name="bas"
            defaultValue={bas}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Bitiş</label>
          <input
            type="date"
            name="bit"
            defaultValue={bit}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Filtrele
        </button>
        {(bas || bit) && (
          <Link
            href="/admin/havale-onaylari"
            className="px-2 py-2 text-sm font-medium text-slate-500 hover:text-brand-navy"
          >
            Temizle
          </Link>
        )}
        <span className="ml-auto self-center text-sm text-slate-400">{transfers.length} kayıt</span>
      </form>

      <div className="mt-6">
        {transfers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Seçilen aralıkta havale/EFT kaydı yok.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Alıcı</th>
                  <th className="px-5 py-3 font-medium">Satıcı</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium text-right">Durum</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((order) => {
                  const approved = APPROVED.has(order.status);
                  return (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-4 text-slate-500">{dateFmt.format(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-brand-navy">{order.gig.title}</p>
                        <p className="text-xs text-slate-400">
                          Sipariş #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{order.buyer.name}</td>
                      <td className="px-5 py-4 text-slate-600">{order.gig.seller.name}</td>
                      <td className="px-5 py-4 font-semibold text-brand-navy">
                        {formatPrice(order.amount)}₺
                      </td>
                      <td className="px-5 py-4 text-right">
                        {approved ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Onaylandı
                          </span>
                        ) : (
                          <Link
                            href={`/siparis/${order.id}`}
                            className="font-semibold text-purple-700 hover:underline"
                          >
                            İncele ve Onayla
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
