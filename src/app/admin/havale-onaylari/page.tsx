import Link from "next/link";
import { listPendingBankTransfers } from "@/lib/order-actions";
import { formatPrice } from "@/lib/format-price";

export default async function BankTransferApprovalsPage() {
  const pending = await listPendingBankTransfers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Havale/EFT Onayları</h1>
      <p className="mt-1 text-sm text-slate-500">Onay bekleyen tüm havale/EFT bildirimleri.</p>

      <div className="mt-8">
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Onay bekleyen havale/EFT bildirimi yok.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Alıcı</th>
                  <th className="px-5 py-3 font-medium">Satıcı</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-navy">{order.gig.title}</p>
                      <p className="text-xs text-slate-400">
                        Sipariş #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{order.buyer.name}</td>
                    <td className="px-5 py-4 text-slate-600">{order.gig.seller.name}</td>
                    <td className="px-5 py-4 font-semibold text-brand-navy">{formatPrice(order.amount)}₺</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/siparis/${order.id}`}
                        className="font-semibold text-purple-700 hover:underline"
                      >
                        İncele ve Onayla
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
