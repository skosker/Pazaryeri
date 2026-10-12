import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/format-price";
import { amountInWords } from "@/lib/expense-voucher-math";
import { PAID_WITH_LABEL, listUserInvoiceRows } from "@/lib/invoices";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "@/components/print-button";

const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[11rem_1fr] gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-brand-navy">{children}</span>
    </div>
  );
}

/**
 * Ödeme Makbuzu: proof that a membership, corporate plan or "Öne Çıkar" payment reached
 * Prosinta, printable at once. It is not an invoice and says so; the e-Arşiv invoice is
 * cut separately and shows up in Faturalarım.
 */
export default async function PaymentReceiptPage(props: PageProps<"/panel/faturalarim/makbuz/[kind]/[id]">) {
  const { kind, id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/giris?callbackUrl=/panel/faturalarim/makbuz/${kind}/${id}`);
  if (kind !== "uyelik" && kind !== "one-cikar") notFound();

  const row = (await listUserInvoiceRows(session.user.id)).find((r) => r.kind === kind && r.id === id);
  if (!row) notFound();
  const c = row.customer;

  return (
    <div>
      <style>{"@page { size: A4; margin: 14mm; } @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }"}</style>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/panel/faturalarim" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Faturalarım
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto mt-4 max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-sm print:mt-0 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark size={34} idPrefix="makbuz" />
              <span className="text-2xl font-extrabold tracking-tight text-brand-navy">Prosinta</span>
            </div>
            <p className="mt-3 font-bold uppercase text-slate-600">{COMPANY.name}</p>
            <p className="text-slate-500">{COMPANY.address}</p>
            <p className="text-slate-500">
              {COMPANY.taxOffice} V.D. {COMPANY.taxNumber} · {COMPANY.email}
            </p>
          </div>
          <div className="min-w-56 text-right">
            <p className="bg-purple-700 px-4 py-2 text-center text-lg font-bold tracking-wide text-white">ÖDEME MAKBUZU</p>
            <p className="mt-3 text-slate-500">
              Makbuz No: <span className="font-mono font-semibold text-brand-navy">M-{id.slice(-8).toUpperCase()}</span>
            </p>
            <p className="text-slate-500">Ödeme tarihi: <span className="text-brand-navy">{dateTimeFmt.format(row.date)}</span></p>
          </div>
        </header>

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-purple-700">Ödeyen</h2>
        <div className="mt-1">
          <Row label={c.companyName ? "Şirket unvanı" : "Adı soyadı"}>{c.companyName ?? c.name}</Row>
          {c.taxNumber && <Row label={c.companyName ? "Vergi dairesi / VKN" : "T.C. kimlik no"}>{c.companyName ? `${c.taxOffice} · ${c.taxNumber}` : c.taxNumber}</Row>}
          {c.address && <Row label="Adres">{c.address}</Row>}
          <Row label="E-posta">{c.email}</Row>
        </div>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-purple-700">Ödeme</h2>
        <div className="mt-1">
          <Row label="Hizmet">{row.service}</Row>
          <Row label="Ödeme yöntemi">{(row.paidWith && PAID_WITH_LABEL[row.paidWith]) ?? "—"}</Row>
          <Row label="Tutar">
            <span className="text-lg font-extrabold tracking-tight text-purple-700">{formatPrice(row.total)} TL</span>
            <span className="ml-2 text-xs text-slate-400">KDV dahil</span>
          </Row>
          <Row label="Yalnız">{amountInWords(row.total)}</Row>
          <Row label="Fatura">{row.invoiceNo ? `e-Arşiv fatura no ${row.invoiceNo}` : "Hazırlanıyor"}</Row>
        </div>

        <p className="mt-8 rounded-xl bg-purple-50 px-4 py-3 text-xs leading-relaxed text-purple-900">
          Bu makbuz ödemenin Prosinta&apos;ya ulaştığını gösterir; <strong>fatura yerine geçmez</strong>. e-Arşiv faturan ayrıca
          düzenlenip e-posta adresine gönderilir ve Panel → Faturalarım&apos;dan indirilebilir.
        </p>
      </article>
    </div>
  );
}
