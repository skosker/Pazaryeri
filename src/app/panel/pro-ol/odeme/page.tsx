import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isMockPaymentAllowed, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { findOrCreatePendingProPurchase, membershipQuote } from "@/lib/pro-purchase";
import {
  PERIOD_LABEL,
  PLAN_LABEL,
  PLAN_SLUG,
  hasPaidPeriod,
  membershipSelect,
  membershipTier,
  parsePeriod,
  parsePlan,
  untilFormat,
} from "@/lib/membership";
import Link from "next/link";
import { getBankAccounts } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";
import { ProMockCheckoutForm } from "./pro-mock-checkout-form";
import { ProBankTransferPanel } from "./pro-bank-transfer-panel";
import { completeMockProPayment, failMockProPayment, notifyProBankTransferAction } from "./actions";
import { PaymentMethodTabs } from "@/app/odeme/[orderId]/payment-method-tabs";
import { PaytrEmbed } from "@/app/odeme/[orderId]/paytr-embed";
import { PurchaseConsent } from "@/components/purchase-consent";
import { MesafeliHizmetSozlesmesi, OnBilgilendirmeFormu, type PurchaseInfo } from "@/components/purchase-documents";
import { acceptPurchaseTermsAction } from "@/app/panel/purchase-terms-actions";
import { purchaseBuyer } from "@/lib/purchase-terms";
import { getSettings } from "@/lib/settings";
import { freeBoostDays, portfolioLimitFor } from "@/lib/membership";

export default async function ProOdemePage(props: PageProps<"/panel/pro-ol/odeme">) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const plan = parsePlan(searchParams.paket);
  const period = parsePeriod(searchParams.donem);
  const here = `/panel/pro-ol/odeme?paket=${plan ? PLAN_SLUG[plan] : ""}&donem=${period ?? ""}`;
  if (!session?.user) redirect(`/giris?callbackUrl=${encodeURIComponent(here)}`);
  if (session.user.role !== "FREELANCER") redirect("/uyelik");
  if (!plan || !period) redirect("/panel/pro-ol");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, ...membershipSelect },
  });
  if (!user) redirect("/panel");
  // Süresiz Pro has nothing to gain from buying Pro again (Pro Plus still makes sense).
  if (user.isPro && plan === "PRO") redirect("/panel/pro-ol");
  const tier = membershipTier(user);
  const paid = hasPaidPeriod(user);

  const errorMessage =
    searchParams.hata === "odeme-basarisiz" ? "Ödeme başarısız oldu, tekrar deneyin." : null;

  const [purchase, bankAccounts] = await Promise.all([
    findOrCreatePendingProPurchase(session.user.id, plan, period),
    getBankAccounts(),
  ]);
  const quote = await membershipQuote(plan, period);
  const title = `${PLAN_LABEL[plan]} · ${PERIOD_LABEL[period]}`;

  const price = Number(purchase.amount);
  const [settings, party] = await Promise.all([getSettings(), purchaseBuyer(session.user.id)]);
  const boostDays = freeBoostDays(plan, settings);
  const docInfo: PurchaseInfo = {
    service: `Prosinta ${PLAN_LABEL[plan]} üyelik paketi (${PERIOD_LABEL[period]}, ${period === "yillik" ? "12 ay" : "1 ay"})`,
    features: [
      `${PLAN_LABEL[plan]} rozeti ve varsayılan sıralamada öncelik`,
      `İlan başına ${portfolioLimitFor(plan, settings)} örnek iş görseli`,
      ...(boostDays > 0 ? [`Her ay ${boostDays} gün ücretsiz Öne Çıkar hakkı`] : []),
      ...(plan === "PRO_PLUS" ? ["Freelancer Bul listesinde üst sıralar"] : []),
      ...(plan === "PRO_PLUS" && settings.plusBoostDiscountPercent > 0
        ? [`Öne Çıkar satın alımlarında %${settings.plusBoostDiscountPercent} indirim`]
        : []),
    ],
    price,
    duration: period === "yillik" ? "12 ay" : "1 ay",
    ...party,
  };
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
        basket: [{ name: `Prosinta ${title} üyelik`, price: price, quantity: 1 }],
        okUrl: `${appUrl}/panel/pro-ol?odendi=1`,
        failUrl: `${appUrl}${here}&hata=odeme-basarisiz`,
      });

      await prisma.proPurchase.update({
        where: { id: purchase.id },
        data: { token: paytrToken },
      });
    } catch (error) {
      tokenError = error instanceof Error ? error.message : "Ödeme başlatılamadı";
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/panel/pro-ol" className="text-sm text-slate-500 hover:text-brand-navy">
        ← Üyelik Paketleri
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">{title} Üyelik</h1>
      <p className="mt-1 text-sm text-slate-500">
        {quote.perkPercent > 0 && <span className="mr-1 text-slate-400 line-through">{formatPrice(quote.listAmount)} TL</span>}
        {formatPrice(price)} TL · {period === "yillik" ? "12 ay" : "1 ay"}, otomatik yenilenmez.
        {quote.perkPercent > 0 && (
          <span className="ml-1 font-semibold text-rose-600">
            {quote.perkName} indirimi: %{quote.perkPercent}
          </span>
        )}
      </p>

      {paid && (
        <p className="mt-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-800">
          {tier === (plan === "PRO_PLUS" ? "PRO_PLUS" : "PRO")
            ? `Mevcut üyeliğin ${untilFormat.format(user.proUntil!)} tarihinde bitiyor; yeni süre bunun üzerine eklenir.`
            : `Mevcut ${tier === "PRO_PLUS" ? "Pro Plus" : "Pro"} üyeliğinin kalan süresi, iki paketin fiyat oranına göre ${PLAN_LABEL[plan]} süresine çevrilip eklenir.`}
        </p>
      )}

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage ?? tokenError}
        </p>
      )}

      <div className="mt-6">
        <PurchaseConsent
          acceptAction={acceptPurchaseTermsAction.bind(null, "uyelik", purchase.id)}
          initiallyAccepted={purchase.termsAcceptedAt !== null}
          consumer={docInfo.consumer}
          onBilgilendirme={<OnBilgilendirmeFormu info={docInfo} />}
          sozlesme={<MesafeliHizmetSozlesmesi info={docInfo} />}
        >
        <PaymentMethodTabs
          cardContent={
            // Unlike order checkout, Pro's card option cannot fall back to hiding just
            // itself while PayTR is in test mode without anything shown at all — Havale/
            // EFT is offered here too, so hiding the card tab has a real alternative next
            // to it, same as orders.
            isPaytrTestMode || (isMockPayment && !isMockPaymentAllowed) ? undefined : isMockPayment ? (
              <ProMockCheckoutForm
                amount={price}
                onComplete={completeMockProPayment.bind(null, PLAN_SLUG[plan], period)}
                onFail={failMockProPayment.bind(null, PLAN_SLUG[plan], period)}
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
              onNotify={notifyProBankTransferAction.bind(null, PLAN_SLUG[plan], period)}
              activatesLabel={`${PLAN_LABEL[plan]} üyeliğin`}
            />
          }
        />
        </PurchaseConsent>
      </div>
    </div>
  );
}
