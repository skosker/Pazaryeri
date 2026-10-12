import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format-price";
import { invoicePdfKeys, listUserInvoiceRows, purchaseServiceLabel } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { isPartialRefund, needsNoInvoice } from "@/lib/refund-labels";
import { withdrawRefundAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

/**
 * Panel → Faturalarım: what the member bought from Prosinta (memberships, corporate plans,
 * "Öne Çıkar") and, for a freelancer, the aracılık hizmet bedeli invoiced to them. Each row
 * shows its e-Arşiv invoice once Prosinta has cut it, and paid sales have a payment receipt.
 */
export default async function MyInvoicesPage(props: PageProps<"/panel/faturalarim">) {
  const { iade } = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?callbackUrl=/panel/faturalarim");
  const userId = session.user.id;
  const [rows, waitingPurchases, waitingBoosts] = await Promise.all([
    listUserInvoiceRows(userId),
    prisma.proPurchase.findMany({
      where: { userId, provider: "havale", status: "INITIALIZED" },
      select: { id: true, plan: true, months: true, amount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gigBoost.findMany({
      where: { userId, provider: "havale", status: "INITIALIZED" },
      select: { id: true, days: true, amount: true, createdAt: true, gig: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const pdfs = await invoicePdfKeys(rows);
  // Bank transfers declared but not yet confirmed by Prosinta: no invoice or receipt until then.
  const waiting = [
    ...waitingPurchases.map((p) => ({ id: p.id, date: p.createdAt, service: purchaseServiceLabel(p.plan, p.months), total: Number(p.amount) })),
    ...waitingBoosts.map((b) => ({ id: b.id, date: b.createdAt, service: `Öne Çıkar (${b.days} gün) · ${b.gig.title}`, total: Number(b.amount) })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Faturalarım</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Prosinta&apos;dan aldığın üyelik, paket ve Öne Çıkar hizmetlerinin faturaları. e-Arşiv faturan kesildiğinde burada
        görünür ve e-posta adresine de gönderilir. Ödemenin hemen ardından ödeme makbuzunu indirebilirsin.
      </p>

      {iade === "talep" && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          İade talebin alındı. İnceleme sonucunu burada ve e-postanda göreceksin.
        </p>
      )}

      {waiting.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="text-sm font-semibold text-amber-900">Onay Bekleyen Ödemeler</p>
          <p className="mt-0.5 text-xs text-amber-800">
            Havale/EFT bildirimin Prosinta ekibi tarafından kontrol ediliyor. Onaylanınca üyeliğin açılır, ödeme makbuzu ve
            faturası aşağıdaki listeye gelir.
          </p>
          <ul className="mt-3 divide-y divide-amber-100 text-sm">
            {waiting.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="text-slate-600">{dateFmt.format(w.date)}</span>
                <span className="text-brand-navy">{w.service}</span>
                <span className="ml-auto font-semibold text-brand-navy">{formatPrice(w.total)} TL</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-700">Ödeme onayı bekleniyor</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length === 0 ? (
        waiting.length === 0 && (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Henüz faturalanacak bir alımın yok.
          </p>
        )
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
                  <td className="px-4 py-3 text-brand-navy">
                    {r.service}
                    {r.refund?.status === "REQUESTED" && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          İade talebi inceleniyor
                        </span>
                        <form action={withdrawRefundAction.bind(null, r.id)}>
                          <button className="text-xs text-slate-400 hover:text-red-600">Talebi geri çek</button>
                        </form>
                      </div>
                    )}
                    {r.refund?.status === "REFUNDED" && (
                      <p className="mt-1.5">
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {isPartialRefund(r.refund, r.total) ? "Kısmi iade" : "İade edildi"} · {formatPrice(r.refund.amount ?? 0)} TL
                          {r.refund.decidedAt ? ` · ${dateFmt.format(r.refund.decidedAt)}` : ""}
                        </span>
                      </p>
                    )}
                    {r.refund?.status === "REJECTED" && (
                      <div className="mt-1.5">
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">İade talebi kabul edilmedi</span>
                        {r.refund.rejectReason && <p className="mt-1 text-xs text-slate-500">{r.refund.rejectReason}</p>}
                      </div>
                    )}
                  </td>
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
                    ) : needsNoInvoice(r.refund, r.total, r.invoiceNo) ? (
                      <span className="text-xs text-slate-400">İade edildi, fatura kesilmeyecek</span>
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
                    {r.kind === "uyelik" && !r.refund && (
                      <Link href={`/panel/faturalarim/iade/${r.id}`} className="mt-1.5 block whitespace-nowrap text-xs text-slate-400 hover:text-brand-navy hover:underline">
                        İade Talep Et
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
