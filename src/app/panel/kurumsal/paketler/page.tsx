import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { buildCorpPlanCards } from "@/lib/corporate-plan-cards";
import { CORP_PLAN_LABEL } from "@/lib/corporate-plans";
import { pendingProBankTransfer } from "@/lib/pro-purchase";
import { PURCHASE_PLAN_LABEL, untilFormat } from "@/lib/membership";
import { formatPrice } from "@/lib/format-price";
import { MembershipPlans } from "@/components/membership-plans";

export default async function CorporatePlansPage(props: PageProps<"/panel/kurumsal/paketler">) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/kurumsal/paketler");
  const [{ plans, state }, pending] = await Promise.all([
    buildCorpPlanCards(session.user.id),
    pendingProBankTransfer(session.user.id, true),
  ]);
  // Hidden until switched on at /admin/ayarlar, and only for company accounts.
  if (!state.open) notFound();
  const searchParams = await props.searchParams;

  return (
    <div>
      <Link href="/panel/kurumsal" className="text-sm text-slate-500 hover:text-brand-navy">
        ← Kurumsal Hesap
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Kurumsal Paketler</h1>
      <p className="mt-1 text-sm text-slate-500">
        Şirketinin alımlarında indirim ve bakiye bonusu. Paketini istediğin zaman yükseltebilirsin; kalan süren yeni
        paketine aktarılır.
      </p>

      {searchParams.odendi === "1" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Ödemen alındı, paketin güncellendi.
        </p>
      )}
      {state.tier && state.until && (
        <p className="mt-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-800">
          <strong>{CORP_PLAN_LABEL[state.tier]}</strong> paketin {untilFormat.format(state.until)} tarihine kadar geçerli.
        </p>
      )}
      {pending && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {PURCHASE_PLAN_LABEL[pending.plan]} paketi için {formatPrice(pending.amount)} TL Havale/EFT bildirimin alındı;
          onaylanınca paketin güncellenecek.
        </p>
      )}

      <div className="mt-8">
        <MembershipPlans plans={plans} yearlyDiscountPercent={state.settings.yearlyDiscountPercent} />
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Paketler otomatik yenilenmez; süre bitince Temel pakete dönersin, bakiyen ve geçmişin korunur.
      </p>
    </div>
  );
}
