import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { INVOICE_KIND_LABEL, listInvoiceRows, parseInvoiceKind, splitVat, type InvoiceKind } from "@/lib/invoices";
import { clearInvoiceAction, markInvoicedAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" });

export default async function InvoicesPage(props: PageProps<"/admin/faturalar">) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const done = searchParams.durum === "kesilen";
  const kind = parseInvoiceKind(searchParams.tur);
  const [rows, settings] = await Promise.all([listInvoiceRows(done, kind), getSettings()]);
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const href = (next: { durum?: string; tur?: InvoiceKind | null }) => {
    const q = new URLSearchParams();
    const durum = next.durum ?? (done ? "kesilen" : "bekleyen");
    if (durum === "kesilen") q.set("durum", "kesilen");
    const tur = next.tur === undefined ? kind : next.tur;
    if (tur) q.set("tur", tur);
    const s = q.toString();
    return s ? `/admin/faturalar?${s}` : "/admin/faturalar";
  };
  const exportHref = `/admin/faturalar/disa-aktar?durum=${done ? "kesilen" : "bekleyen"}${kind ? `&tur=${kind}` : ""}`;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Faturalar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prosinta&apos;nın kendi satışları ve komisyonu. Faturayı muhasebe programında kesip numarasını buraya gir.
            Tutarlar KDV dahil (%{settings.vatPercent.toLocaleString("tr-TR")}).
          </p>
        </div>
        <a
          href={exportHref}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Excel&apos;e Aktar (CSV)
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {[
          { key: "bekleyen", label: "Kesilecek" },
          { key: "kesilen", label: "Kesilen" },
        ].map((t) => (
          <Link
            key={t.key}
            href={href({ durum: t.key })}
            className={`rounded-full px-4 py-1.5 font-semibold ${
              (t.key === "kesilen") === done ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-slate-200" />
        {([null, "uyelik", "one-cikar", "komisyon"] as const).map((k) => (
          <Link
            key={k ?? "tumu"}
            href={href({ tur: k })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              kind === (k ?? undefined) ? "bg-purple-100 text-purple-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {k ? INVOICE_KIND_LABEL[k] : "Tümü"}
          </Link>
        ))}
        <span className="ml-auto text-slate-500">
          {rows.length} kayıt · <strong className="text-brand-navy">{formatPrice(total)} TL</strong>
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          {done ? "Henüz fatura numarası girilmiş kayıt yok." : "Kesilecek fatura yok."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Fatura Edilecek</th>
                <th className="px-4 py-3 font-medium">Hizmet</th>
                <th className="px-4 py-3 text-right font-medium">Tutar</th>
                <th className="px-4 py-3 font-medium">{done ? "Fatura" : "Fatura No"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const { base, vat } = splitVat(r.total, settings.vatPercent);
                const c = r.customer;
                return (
                  <tr key={`${r.kind}-${r.id}`} className="border-b border-slate-100 align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {dateFmt.format(r.date)}
                      <span className="mt-1 block text-[11px] font-semibold text-purple-700">{INVOICE_KIND_LABEL[r.kind]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-navy">{c.companyName ?? c.name}</p>
                      {c.companyName && (
                        <p className="text-xs text-slate-500">
                          {c.taxOffice} · {c.taxNumber}
                          {c.address && <span className="block">{c.address}</span>}
                        </p>
                      )}
                      {!c.companyName && (
                        <p className="text-xs text-slate-500">
                          {c.taxNumber ? `TCKN ${c.taxNumber}` : "TCKN yok · nihai tüketici"}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {c.companyName ? `${c.name} · ` : ""}
                        {c.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.service}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <p className="font-semibold text-brand-navy">{formatPrice(r.total)} TL</p>
                      <p className="text-[11px] text-slate-400">
                        {formatPrice(base)} + KDV {formatPrice(vat)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {r.invoiceNo ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-mono text-xs font-semibold text-emerald-700">{r.invoiceNo}</p>
                            {r.invoicedAt && <p className="text-[11px] text-slate-400">{dateFmt.format(r.invoicedAt)}</p>}
                          </div>
                          <form action={clearInvoiceAction.bind(null, r.kind, r.id)}>
                            <button className="text-[11px] text-slate-400 hover:text-red-600" title="Kesilmedi olarak geri al">
                              Geri Al
                            </button>
                          </form>
                        </div>
                      ) : (
                        <form action={markInvoicedAction.bind(null, r.kind, r.id)} className="flex gap-1.5">
                          <input
                            name="invoiceNo"
                            required
                            maxLength={64}
                            aria-label="Fatura numarası"
                            className="w-36 rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs outline-none focus:border-purple-400"
                          />
                          <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                            Kesildi
                          </button>
                        </form>
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
  );
}
