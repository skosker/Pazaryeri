import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format-price";
import { formatIban } from "@/lib/iban";
import { PAID_WITH_LABEL, purchaseServiceLabel } from "@/lib/invoices";
import { getRefundCase, isRefundable } from "@/lib/refunds";
import { requestRefundAction } from "../../actions";
import { RefundRequestForm } from "./refund-request-form";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

/** Panel → Faturalarım → İade Talep Et: the member asks for a membership refund. */
export default async function RefundRequestPage(props: PageProps<"/panel/faturalarim/iade/[id]">) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/giris?callbackUrl=/panel/faturalarim/iade/${id}`);

  const c = await getRefundCase(id);
  if (!c || c.userId !== session.user.id || !isRefundable(c)) notFound();
  // One refund record per purchase: its status is shown in Faturalarım.
  if (c.refund) redirect("/panel/faturalarim");

  return (
    <div className="max-w-3xl">
      <Link href="/panel/faturalarim" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Faturalarım
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">İade Talebi</h1>

      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-400">Hizmet</p>
          <p className="font-semibold text-brand-navy">{purchaseServiceLabel(c.plan, c.months)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Ödeme</p>
          <p className="font-semibold text-brand-navy">{formatPrice(Number(c.amount))} TL</p>
          <p className="text-xs text-slate-500">{PAID_WITH_LABEL[c.provider] ?? c.provider} · {dateFmt.format(c.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">İade Yöntemi</p>
          <p className="font-semibold text-brand-navy">
            {c.provider === "havale" ? "Bildireceğin IBAN'a" : c.provider === "bakiye" ? "Kurumsal bakiyene" : "Ödediğin karta"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">Üyelik paketlerinde iade koşulları</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Paketler ödemeyle birlikte anında başladığından cayma hakkı bulunmaz (Mesafeli Sözleşmeler Yönetmeliği m. 15).</li>
          <li>Mükerrer ödeme, hatalı tahsilat ya da hizmetin Platform kaynaklı sunulamaması hâllerinde tutar iade edilir.</li>
          <li>Paket değişikliğinde kalan süre yeni pakete aktarılır; kalan süre için nakit iade yapılmaz.</li>
          <li>Onaylanan iadede üyeliğin, iade edilen döneme göre kısaltılır ya da sonlandırılır.</li>
        </ul>
        <Link href="/iptal-iade-kosullari" target="_blank" className="mt-2 inline-block font-semibold underline">
          İptal ve İade Koşulları
        </Link>
      </div>

      <div className="mt-5">
        <RefundRequestForm
          action={requestRefundAction.bind(null, c.id)}
          askIban={c.provider === "havale"}
          defaults={{ iban: c.user.iban ? formatIban(c.user.iban) : "", ibanHolder: c.user.ibanHolder ?? c.user.name }}
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Talebin Prosinta ekibine iletilir; sonuç Faturalarım sayfasında görünür ve e-postana gönderilir.
      </p>
    </div>
  );
}
