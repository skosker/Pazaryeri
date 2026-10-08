import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/format-price";
import { formatIban } from "@/lib/iban";
import { VOUCHER_SERIES, amountInWords, getVoucher, voucherNumberLabel } from "@/lib/expense-voucher";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { cancelVoucherAction } from "../actions";
import { CancelVoucherForm } from "./cancel-form";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });
const qty = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

function Dotted({ label, value, fit = false }: { label: string; value?: string | null; fit?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <span className={`shrink-0 whitespace-nowrap font-semibold text-slate-600 ${fit ? "" : "w-32"}`}>{label}</span>
      <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5 text-brand-navy">{value || " "}</span>
    </div>
  );
}

/** One gider pusulası, laid out like the printed form (A4 landscape) and printable from here. */
export default async function ExpenseVoucherPage(props: PageProps<"/admin/gider-pusulalari/[id]">) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const v = await getVoucher(id);
  if (!v) notFound();
  const blankRows = Math.max(0, 3 - v.items.length);

  return (
    <div>
      <style>{"@page { size: A4 landscape; margin: 12mm; } @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }"}</style>

      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <Link href="/admin/gider-pusulalari" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Gider Pusulaları
        </Link>
        <div className="flex flex-wrap items-start gap-2">
          {!v.cancelledAt && <CancelVoucherForm action={cancelVoucherAction.bind(null, v.id)} />}
          <PrintButton />
        </div>
      </div>
      {query.yeni === "1" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">
          Kaydedildi: {VOUCHER_SERIES} {voucherNumberLabel(v.number)}. İki nüsha yazdırıp imzalatın; bir nüshası işi yapana verilir.
        </p>
      )}
      {v.cancelledAt && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          İPTAL EDİLDİ · {dateFmt.format(v.cancelledAt)} · {v.cancelReason}
        </p>
      )}

      <div className="mt-4 overflow-x-auto print:mt-0 print:overflow-visible">
        <article className="mx-auto min-w-[1000px] max-w-[1100px] rounded-2xl border border-slate-200 bg-white p-10 text-[13px] text-brand-navy print:min-w-0 print:max-w-none print:rounded-none print:border-0 print:p-0">
          <header className="grid grid-cols-[1fr_20rem] gap-10">
            <div>
              <div className="flex items-center gap-2">
                <LogoMark size={40} idPrefix="gider-pusulasi" />
                <span className="text-3xl font-extrabold tracking-tight">Prosinta</span>
              </div>
              <p className="mt-4 font-bold uppercase text-slate-600">{COMPANY.name}</p>
              <p className="text-slate-600">{COMPANY.address}</p>
              <p className="mt-2 text-slate-600"><b>E :</b> {COMPANY.email}</p>
              <p className="text-slate-600"><b>W :</b> prosinta.com.tr</p>
              <p className="mt-2 text-slate-600">
                <b>{COMPANY.taxOffice.toLocaleUpperCase("tr-TR")} V.D.</b> {COMPANY.taxNumber} · <b>TİCARET SİCİL NO</b> {COMPANY.tradeRegistry}
              </p>
            </div>
            <div>
              <p className="bg-purple-700 py-2 text-center text-xl font-bold tracking-wide text-white">GİDER PUSULASI</p>
              <dl className="mt-6 space-y-3 text-sm text-slate-600">
                <div><dt className="inline font-bold">TARİH : </dt><dd className="inline text-brand-navy">{dateFmt.format(v.issuedAt)}</dd></div>
                <div><dt className="inline font-bold">SERİ : </dt><dd className="inline font-bold text-brand-navy">{VOUCHER_SERIES}</dd></div>
                <div><dt className="inline font-bold">SIRA NO : </dt><dd className="inline font-mono text-brand-navy">{voucherNumberLabel(v.number)}</dd></div>
              </dl>
            </div>
          </header>

          <table className="mt-8 w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[36%]" /><col className="w-[18%]" /><col className="w-[12%]" /><col className="w-[16%]" /><col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="bg-purple-700 text-white">
                {["İşin Mahiyeti", "Cinsi", "Adedi", "Fiyatı (TL)", "Tutarı (TL)"].map((h) => (
                  <th key={h} className="border border-purple-300 px-3 py-2 text-center font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {v.items.map((item, i) => (
                <tr key={i}>
                  <td className="border border-purple-200 px-3 py-2">{item.description}</td>
                  <td className="border border-purple-200 px-3 py-2">{item.kind}</td>
                  <td className="border border-purple-200 px-3 py-2 text-right">{qty(item.quantity)}</td>
                  <td className="border border-purple-200 px-3 py-2 text-right">{formatPrice(item.unitPrice)}</td>
                  <td className="border border-purple-200 px-3 py-2 text-right">{formatPrice(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: blankRows }, (_, i) => (
                <tr key={`b${i}`} className="h-9">
                  {Array.from({ length: 5 }, (_, j) => <td key={j} className="border border-purple-200" />)}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 grid grid-cols-[1fr_22rem] gap-10">
            <div className="space-y-3">
              <Dotted label="Yalnız :" value={amountInWords(v.gross)} />
              <p className="font-semibold">
                {COMPANY.name}<span className="text-slate-600">&apos;den yukarıda belirtilen iş bedelini aldım.</span>
              </p>
              <Dotted label="Adı Soyadı :" value={v.payeeName} />
              <Dotted label="Adresi :" value={v.payeeAddress} />
              <Dotted label="T.C. Kimlik No :" value={v.payeeTckn} />
              <Dotted label="IBAN :" value={v.payeeIban ? formatIban(v.payeeIban) : null} />
              <div className="grid grid-cols-2 gap-6 pt-6">
                <Dotted label="İşi Yapan İmza :" fit />
                <Dotted label="Düzenleyen İmza / Kaşe :" fit />
              </div>
            </div>
            <table className="h-fit w-full border-collapse self-start">
              <tbody>
                {[
                  ["Toplam", formatPrice(v.gross)],
                  [`Gelir Vergisi Stopaj Oranı %`, v.withholdingPercent.toLocaleString("tr-TR")],
                  ["Stopaj Tutarı", formatPrice(v.withholding)],
                  ["Kesinti Toplamı", formatPrice(v.withholding)],
                ].map(([k, val]) => (
                  <tr key={k}>
                    <th className="border border-purple-200 px-3 py-2 text-left font-semibold text-slate-600">{k}</th>
                    <td className="border border-purple-200 px-3 py-2 text-right">{val}{k.endsWith("%") ? "" : " TL"}</td>
                  </tr>
                ))}
                <tr>
                  <th className="border border-purple-300 bg-purple-700 px-3 py-2 text-left font-bold text-white">Ödenecek Net Tutar</th>
                  <td className="border border-purple-300 bg-purple-50 px-3 py-2 text-right font-bold">{formatPrice(v.net)} TL</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-[11px] text-slate-400">
            213 sayılı Vergi Usul Kanunu m. 234 uyarınca vergi mükellefi olmayan kişilerden alınan işler için iki nüsha düzenlenir; bir nüshası işi yapana verilir.
          </p>
        </article>
      </div>
    </div>
  );
}
