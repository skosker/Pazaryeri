import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format-price";
import { buildPlanCards } from "@/lib/membership-plans";
import { freeBoostCredit } from "@/lib/gig-boost";
import { pendingProBankTransfer } from "@/lib/pro-purchase";
import { PERIOD_LABEL, PURCHASE_PLAN_LABEL, hasPaidPeriod, periodOfMonths, untilFormat } from "@/lib/membership";
import { MembershipPlans } from "@/components/membership-plans";
import { ProBadge } from "@/components/pro-badge";
import { startProTrialAction } from "./actions";

export default async function ProOlPage(props: PageProps<"/panel/pro-ol">) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol");
  // Membership is for freelancers; everyone else gets the public plans page.
  if (session.user.role !== "FREELANCER") redirect("/uyelik");

  const searchParams = await props.searchParams;
  const viewer = { id: session.user.id, role: session.user.role };
  const [{ plans, yearlyDiscountPercent, campaignNote, member, tier }, credit, pending] = await Promise.all([
    buildPlanCards(viewer, startProTrialAction),
    freeBoostCredit(session.user.id),
    pendingProBankTransfer(session.user.id),
  ]);
  if (!member) redirect("/panel");

  const paid = hasPaidPeriod(member);
  const pendingPeriod = pending ? periodOfMonths(pending.months) : null;
  const notice =
    searchParams.deneme === "basladi"
      ? { ok: true, text: "Ücretsiz Pro denemen başladı. Rozetin ve ayrıcalıkların hemen geçerli." }
      : searchParams.odendi === "1"
        ? { ok: true, text: "Ödemen alındı, üyeliğin güncellendi." }
        : searchParams.hata === "deneme"
          ? { ok: false, text: "Ücretsiz deneme hakkın bulunmuyor." }
          : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">{tier ? "Üyeliğim" : "Pro Üyelik"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Daha çok görün, daha çok iş al. Paketini istediğin zaman yükseltebilirsin; kalan süren yeni paketine aktarılır.
      </p>

      {notice && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      {tier && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <ProBadge plus={tier === "PRO_PLUS"} size="md" />
              <span className="text-sm font-semibold text-brand-navy">
                {paid
                  ? `${untilFormat.format(member.proUntil!)} tarihine kadar`
                  : "Süresiz"}
              </span>
            </div>
            {paid && member.isPro && (
              <p className="mt-1 text-xs text-slate-500">Bu süre bitince süresiz Pro üyeliğine dönersin.</p>
            )}
          </div>
          {credit && (
            <p className="text-sm text-slate-600">
              {credit.usedOn ? (
                <>Bu ayki ücretsiz Öne Çıkar hakkını kullandın.</>
              ) : (
                <>
                  Bu ay <strong className="text-brand-navy">{credit.days} gün</strong> ücretsiz Öne Çıkar hakkın var.{" "}
                  <Link href="/panel/ilanlarim" className="font-semibold text-purple-700 hover:underline">
                    İlanlarım&apos;dan Kullan
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      )}

      {pending && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {PURCHASE_PLAN_LABEL[pending.plan]}
          {pendingPeriod ? ` (${PERIOD_LABEL[pendingPeriod]})` : ""} için {formatPrice(pending.amount)} TL Havale/EFT
          bildirimin alındı; onaylanınca üyeliğin güncellenecek.
        </p>
      )}

      <div className="mt-8">
        <MembershipPlans plans={plans} yearlyDiscountPercent={yearlyDiscountPercent} campaignNote={campaignNote} />
      </div>
    </div>
  );
}
