import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isMockPaymentAllowed, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { getBankAccounts } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";
import { PERIOD_LABEL, parsePeriod, untilFormat } from "@/lib/membership";
import {
  CORP_PLAN_LABEL,
  CORP_PLAN_SLUG,
  corpPerks,
  corpPlanPrice,
  corporatePlanState,
  findOrCreatePendingCorpPurchase,
  parseCorpPlan,
} from "@/lib/corporate-plans";
import { ProMockCheckoutForm } from "@/app/panel/pro-ol/odeme/pro-mock-checkout-form";
import { ProBankTransferPanel } from "@/app/panel/pro-ol/odeme/pro-bank-transfer-panel";
import { PaymentMethodTabs } from "@/app/odeme/[orderId]/payment-method-tabs";
import { PaytrEmbed } from "@/app/odeme/[orderId]/paytr-embed";
import { PurchaseConsent } from "@/components/purchase-consent";
import { MesafeliHizmetSozlesmesi, OnBilgilendirmeFormu, type PurchaseInfo } from "@/components/purchase-documents";
import { acceptPurchaseTermsAction } from "@/app/panel/purchase-terms-actions";
import { purchaseBuyer } from "@/lib/purchase-terms";
import {
  completeMockCorpPayment,
  failMockCorpPayment,
  notifyCorpBankTransferAction,
  payCorpPlanWithBalanceAction,
} from "./actions";

export default async function CorporatePlanCheckoutPage(props: PageProps<"/panel/kurumsal/paketler/odeme">) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const plan = parseCorpPlan(searchParams.paket);
  const period = parsePeriod(searchParams.donem);
  const here = `/panel/kurumsal/paketler/odeme?paket=${plan ? CORP_PLAN_SLUG[plan] : ""}&donem=${period ?? ""}`;
  if (!session?.user) redirect(`/giris?callbackUrl=${encodeURIComponent(here)}`);
  const state = await corporatePlanState(session.user.id);
  if (!state.open) notFound();
  if (!plan || !period) redirect("/panel/kurumsal/paketler");

  const [user, purchase, bankAccounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { email: true, name: true, balance: true } }),
    findOrCreatePendingCorpPurchase(session.user.id, plan, period),
    getBankAccounts(),
  ]);
  const price = corpPlanPrice(plan, period, state.settings).total;
  const balance = Number(user.balance);
  const title = `${CORP_PLAN_LABEL[plan]} · ${PERIOD_LABEL[period]}`;
  const slug = CORP_PLAN_SLUG[plan];
  const perks = corpPerks(plan, state.settings);
  const docInfo: PurchaseInfo = {
    service: `Prosinta ${CORP_PLAN_LABEL[plan]} kurumsal paket (${PERIOD_LABEL[period]}, ${period === "yillik" ? "12 ay" : "1 ay"})`,
    features: [
      `Siparişlerde %${perks.orderPercent} indirim (ayda en fazla ${formatPrice(perks.orderMaxTl)} TL; Prosinta karşılar)`,
      `Bakiye yüklemelerinde %${perks.bonusPercent} bonus`,
      plan === "KURUMSAL_PLUS" ? "Size özel müşteri temsilcisi" : "Öncelikli destek",
    ],
    price,
    duration: period === "yillik" ? "12 ay" : "1 ay",
    ...(await purchaseBuyer(session.user.id)),
  };

  const errorMessage =
    searchParams.hata === "odeme-basarisiz"
      ? "Ödeme başarısız oldu, tekrar deneyin."
      : typeof searchParams.hata === "string"
        ? searchParams.hata
        : null;

  let paytrToken: string | null = null;
  let tokenError: string | null = null;
  if (!isMockPayment && !isPaytrTestMode) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      paytrToken = await getPaytrToken({
        merchantOid: purchase.id,
        email: user.email,
        amount: price,
        userIp: await clientIp(),
        userName: user.name,
        userAddress: "Prosinta, Türkiye",
        userPhone: "05000000000",
        basket: [{ name: `Prosinta ${title} paket`, price, quantity: 1 }],
        okUrl: `${appUrl}/panel/kurumsal/paketler?odendi=1`,
        failUrl: `${appUrl}${here}&hata=odeme-basarisiz`,
      });
      await prisma.proPurchase.update({ where: { id: purchase.id }, data: { token: paytrToken } });
    } catch (error) {
      tokenError = error instanceof Error ? error.message : "Ödeme başlatılamadı";
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/panel/kurumsal/paketler" className="text-sm text-slate-500 hover:text-brand-navy">
        ← Kurumsal Paketler
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">{title} Paket</h1>
      <p className="mt-1 text-sm text-slate-500">
        {formatPrice(price)} TL · {period === "yillik" ? "12 ay" : "1 ay"}, otomatik yenilenmez.
      </p>

      {state.tier && state.until && (
        <p className="mt-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-800">
          {state.tier === plan
            ? `Mevcut paketin ${untilFormat.format(state.until)} tarihinde bitiyor; yeni süre bunun üzerine eklenir.`
            : `Mevcut ${CORP_PLAN_LABEL[state.tier]} paketinin kalan süresi, iki paketin fiyat oranına göre ${CORP_PLAN_LABEL[plan]} süresine çevrilip eklenir.`}
        </p>
      )}

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage ?? tokenError}</p>
      )}

      <div className="mt-6">
        <PurchaseConsent
          acceptAction={acceptPurchaseTermsAction.bind(null, "uyelik", purchase.id)}
          initiallyAccepted={purchase.termsAcceptedAt !== null}
          consumer={docInfo.consumer}
          onBilgilendirme={<OnBilgilendirmeFormu info={docInfo} />}
          sozlesme={<MesafeliHizmetSozlesmesi info={docInfo} />}
        >
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-brand-navy">Kurumsal Bakiye ile Öde</p>
            <p className="text-sm text-slate-600">
              Bakiyen: <strong>{formatPrice(balance)} TL</strong>
            </p>
          </div>
          {balance >= price ? (
            <form action={payCorpPlanWithBalanceAction.bind(null, slug, period)}>
              <button
                type="submit"
                className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {formatPrice(price)} TL Bakiyeden Öde
              </button>
            </form>
          ) : (
            <Link href="/panel/kurumsal" className="text-sm font-semibold text-purple-700 hover:underline">
              Bakiye yetersiz — bakiye yükle →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            isPaytrTestMode || (isMockPayment && !isMockPaymentAllowed) ? undefined : isMockPayment ? (
              <ProMockCheckoutForm
                amount={price}
                onComplete={completeMockCorpPayment.bind(null, slug, period)}
                onFail={failMockCorpPayment.bind(null, slug, period)}
              />
            ) : paytrToken ? (
              <PaytrEmbed token={paytrToken} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                Kart ile ödeme şu anda başlatılamıyor, lütfen Havale/EFT ile devam edin.
              </p>
            )
          }
          bankContent={
            <ProBankTransferPanel
              amount={price}
              accounts={bankAccounts}
              onNotify={notifyCorpBankTransferAction.bind(null, slug, period)}
              activatesLabel={`${CORP_PLAN_LABEL[plan]} paketin`}
            />
          }
        />
      </div>
        </PurchaseConsent>
      </div>
    </div>
  );
}
