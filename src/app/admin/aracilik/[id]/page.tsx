import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/format-price";
import { formatIban } from "@/lib/iban";
import { PAYMENT_PROVIDER_LABEL, intermediaryRow } from "@/lib/intermediary";
import { PrintButton } from "@/components/print-button";

const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
});
const tl = (n: number) => `${formatPrice(n)} TL`;

function Row({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-6 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${strong ? "font-bold text-brand-navy" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

/** One order's aracılık hizmet bedeli and hakediş statement, from the site's own records; printable. */
export default async function IntermediaryStatementPage(props: PageProps<"/admin/aracilik/[id]">) {
  const { id } = await props.params;
  const r = await intermediaryRow(id);
  if (!r) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/aracilik" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Aracılık Dökümleri
        </Link>
        <PrintButton />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="font-semibold text-brand-navy">{COMPANY.name}</p>
            <p className="text-xs text-slate-500">{COMPANY.address}</p>
            <p className="text-xs text-slate-500">
              Ticaret Sicil No: {COMPANY.tradeRegistry} · {COMPANY.taxOffice} V.D. {COMPANY.taxNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Döküm No</p>
            <p className="font-mono text-xs text-slate-600">{r.payoutId}</p>
          </div>
        </div>

        <h1 className="mt-5 text-xl font-bold text-brand-navy">Aracılık Hizmet Bedeli ve Hakediş Dökümü</h1>
        <p className="mt-1 text-slate-500">
          Sipariş #{r.orderId.slice(-8)} · {r.service}
        </p>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Sipariş</h2>
        <div className="mt-2">
          <Row label="Sipariş no" value={r.orderId} />
          <Row label="Sipariş tarihi" value={dateTimeFmt.format(r.orderedAt)} />
          <Row label="Hizmet" value={`${r.service} · ${r.packageName}`} />
          <Row label="Alıcı" value={`${r.buyer.name} (${r.buyer.email})`} />
          <Row label="Hizmet sağlayıcı (freelancer)" value={`${r.seller.name} (${r.seller.email})`} />
          <Row
            label="Alıcı ödemesi"
            value={r.payment ? `${PAYMENT_PROVIDER_LABEL[r.payment.provider] ?? r.payment.provider} · ${dateTimeFmt.format(r.payment.at)}` : "Kayıtlı değil"}
          />
          <Row label="Teslim onayı (tamamlanma)" value={dateTimeFmt.format(r.completedAt)} />
        </div>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Hesap</h2>
        <div className="mt-2">
          <Row label="Paket bedeli (sipariş tutarı)" value={tl(r.gross)} />
          {r.prosintaDiscounts > 0 && (
            <>
              <Row label="Prosinta'nın karşıladığı indirimler" value={`−${tl(r.prosintaDiscounts)}`} />
              <Row label="Alıcının ödediği" value={tl(r.buyerPaid)} />
            </>
          )}
          <Row label={`Aracılık hizmet bedeli (%${r.commissionPercent.toLocaleString("tr-TR")})`} value={`−${tl(r.commission)}`} />
          <Row label="Freelancer'a net hakediş" value={tl(r.net)} strong />
        </div>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Hakediş Ödemesi</h2>
        <div className="mt-2">
          <Row
            label="Durum"
            value={r.payout.status === "PAID" ? "Ödendi" : r.payout.status === "FAILED" ? "Başarısız" : "Ödeme bekliyor"}
          />
          {r.payout.paidAt && <Row label="Ödeme tarihi" value={dateTimeFmt.format(r.payout.paidAt)} />}
          <Row label="Alıcı hesap" value={r.payout.iban ? formatIban(r.payout.iban) : "Kayıtlı değil"} />
          {r.payout.ibanHolder && <Row label="Hesap sahibi" value={r.payout.ibanHolder} />}
          <Row
            label="Aracılık bedeli faturası"
            value={r.invoiceNo ? `${r.invoiceNo}${r.invoicedAt ? ` · ${dateTimeFmt.format(r.invoicedAt)}` : ""}` : "Henüz kesilmedi"}
          />
        </div>

        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Bu döküm, prosinta.com.tr sipariş ve ödeme kayıtlarından {dateTimeFmt.format(new Date())} tarihinde oluşturulmuştur.
          Fatura yerine geçmez.
        </p>
      </div>
    </div>
  );
}
