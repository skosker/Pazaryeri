import { listPendingPayouts, listRecentPaidPayouts } from "@/lib/payout-actions";
import { formatIban } from "@/lib/iban";
import { MarkPaidForm } from "./mark-paid";

export default async function PayoutsPage() {
  const [pending, paid] = await Promise.all([listPendingPayouts(), listRecentPaidPayouts()]);

  const total = pending.reduce((sum, p) => sum + Number(p.net), 0);
  const blocked = pending.filter((p) => !(p.iban ?? p.seller.iban)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Hakedişler</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tamamlanan siparişlerin satıcı ödemeleri. Havaleyi bankadan yaptıktan sonra
        buradan işaretle.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-xl bg-amber-50 px-4 py-2 text-amber-800">
          Ödenecek: <strong>{total.toLocaleString("tr-TR")}₺</strong> ({pending.length} kayıt)
        </span>
        {blocked > 0 && (
          <span className="rounded-xl bg-red-50 px-4 py-2 text-red-700">
            {blocked} kayıt IBAN eksikliği nedeniyle ödenemiyor
          </span>
        )}
      </div>

      <div className="mt-8">
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Ödeme bekleyen hakediş yok.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Satıcı</th>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Hesap</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((payout) => {
                  // Fall back to the seller's current details when the payout was created
                  // before they filled the form in.
                  const iban = payout.iban ?? payout.seller.iban;
                  const holder = payout.ibanHolder ?? payout.seller.ibanHolder;
                  return (
                    <tr key={payout.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="px-5 py-4">
                        <p className="font-medium text-brand-navy">{payout.seller.name}</p>
                        <p className="text-xs text-slate-400">{payout.seller.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-600">{payout.order.gig.title}</p>
                        <p className="text-xs text-slate-400">
                          #{payout.orderId.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {iban ? (
                          <>
                            <p className="font-mono text-xs text-brand-navy">{formatIban(iban)}</p>
                            <p className="text-xs text-slate-400">{holder}</p>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-red-600">IBAN girilmemiş</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand-navy">
                        {Number(payout.net).toLocaleString("tr-TR")}₺
                      </td>
                      <td className="px-5 py-4 text-right">
                        <MarkPaidForm payoutId={payout.id} disabled={!iban} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paid.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-brand-navy">Son ödenenler</h2>
          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white text-sm">
            {paid.map((payout) => (
              <li key={payout.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="min-w-0">
                  <span className="font-medium text-brand-navy">{payout.seller.name}</span>
                  <span className="ml-2 text-slate-400">{payout.order.gig.title}</span>
                </span>
                <span className="shrink-0 text-slate-500">
                  {Number(payout.net).toLocaleString("tr-TR")}₺
                  {payout.paidAt && ` · ${payout.paidAt.toLocaleDateString("tr-TR")}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
