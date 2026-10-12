import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format-price";
import { invoicePdfKeys, listUserInvoiceRows } from "@/lib/invoices";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

/**
 * Panel → Faturalarım: what the member bought from Prosinta (memberships, corporate plans,
 * "Öne Çıkar") and, for a freelancer, the aracılık hizmet bedeli invoiced to them. Each row
 * shows its e-Arşiv invoice once Prosinta has cut it, and paid sales have a payment receipt.
 */
export default async function MyInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/panel/faturalarim");
  const rows = await listUserInvoiceRows(session.user.id);
  const pdfs = await invoicePdfKeys(rows);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Faturalarım</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Prosinta&apos;dan aldığın üyelik, paket ve Öne Çıkar hizmetlerinin faturaları. e-Arşiv faturan kesildiğinde burada
        görünür ve e-posta adresine de gönderilir. Ödemenin hemen ardından ödeme makbuzunu indirebilirsin.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Henüz faturalanacak bir alımın yok.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Hizmet</th>
                <th className="px-4 py-3 text-right font-medium">Tutar</th>
                <th className="px-4 py-3 font-medium">Fatura</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}:${r.id}`} className="border-b border-slate-50 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateFmt.format(r.date)}</td>
                  <td className="px-4 py-3 text-brand-navy">{r.service}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <p className="font-semibold text-brand-navy">{formatPrice(r.total)} TL</p>
                    <p className="text-[11px] text-slate-400">KDV dahil</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.invoiceNo ? (
                      <>
                        <p className="font-mono text-xs font-semibold text-emerald-700">{r.invoiceNo}</p>
                        {r.invoicedAt && <p className="text-[11px] text-slate-400">{dateFmt.format(r.invoicedAt)}</p>}
                        {pdfs.has(`${r.kind}:${r.id}`) ? (
                          <a href={`/panel/faturalarim/pdf/${r.kind}/${r.id}`} target="_blank" className="mt-1 inline-block text-xs font-semibold text-purple-700 hover:underline">
                            Faturayı İndir (PDF)
                          </a>
                        ) : (
                          <p className="text-[11px] text-slate-400">e-postana gönderildi</p>
                        )}
                      </>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Hazırlanıyor</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.kind !== "komisyon" && (
                      <Link href={`/panel/faturalarim/makbuz/${r.kind}/${r.id}`} className="whitespace-nowrap text-xs font-semibold text-purple-700 hover:underline">
                        Ödeme Makbuzu →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Fatura bilgilerini (şirket unvanı, vergi no, adres) Profilim sayfasından güncelleyebilirsin; faturalar kesildiği andaki bilgilerle düzenlenir.
      </p>
    </div>
  );
}
