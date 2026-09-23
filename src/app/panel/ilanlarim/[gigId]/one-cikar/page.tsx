import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { boostableGig, findOrCreatePendingBoost, isSponsored } from "@/lib/gig-boost";
import { getBankAccounts } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";
import { ProMockCheckoutForm } from "@/app/panel/pro-ol/odeme/pro-mock-checkout-form";
import { ProBankTransferPanel } from "@/app/panel/pro-ol/odeme/pro-bank-transfer-panel";
import { PaymentMethodTabs } from "@/app/odeme/[orderId]/payment-method-tabs";
import { PaytrEmbed } from "@/app/odeme/[orderId]/paytr-embed";
import { completeMockBoostPayment, failMockBoostPayment, notifyBoostBankTransferAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function BoostGigPage(props: PageProps<"/panel/ilanlarim/[gigId]/one-cikar">) {
  const { gigId } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/panel/ilanlarim/${gigId}/one-cikar`);

  const gig = await boostableGig(session.user.id, gigId);
  if (!gig) redirect("/panel/ilanlarim");

  const searchParams = await props.searchParams;
  const errorMessage =
    searchParams.hata === "odeme-basarisiz" ? "Ödeme başarısız oldu, tekrar deneyin." : null;

  const [user, boost, bankAccounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { email: true, name: true } }),
    findOrCreatePendingBoost(session.user.id, gigId),
    getBankAccounts(),
  ]);

  const price = Number(boost.amount);
  const days = boost.days;
  let paytrToken: string | null = null;
  let tokenError: string | null = null;

  if (!isMockPayment && !isPaytrTestMode) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      paytrToken = await getPaytrToken({
        merchantOid: boost.id,
        email: user.email,
        amount: price,
        userIp: await clientIp(),
        userName: user.name,
        userAddress: "Prosinta, Türkiye",
        userPhone: "05000000000",
        basket: [{ name: `Prosinta Öne Çıkar (${days} gün)`, price: price, quantity: 1 }],
        okUrl: `${appUrl}/panel/ilanlarim?one-cikarildi=1`,
        failUrl: `${appUrl}/panel/ilanlarim/${gigId}/one-cikar?hata=odeme-basarisiz`,
      });
      await prisma.gigBoost.update({ where: { id: boost.id }, data: { token: paytrToken } });
    } catch (error) {
      tokenError = error instanceof Error ? error.message : "Ödeme başlatılamadı";
    }
  }

  const running = isSponsored(gig.sponsoredUntil);

  return (
    <div className="max-w-xl">
      <Link href="/panel/ilanlarim" className="text-sm text-slate-500 hover:text-brand-navy">
        ← İlanlarım
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">İlanını Öne Çıkar</h1>
      <p className="mt-1 text-sm text-slate-500">{gig.title}</p>

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> {days} gün boyunca kategori ve arama
          sonuçlarında en üstte
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> İlan kartında &quot;Sponsorlu&quot; etiketi
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Tek seferlik {formatPrice(price)}₺,
          otomatik yenilenmez
        </li>
      </ul>

      {running && (
        <p className="mt-5 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-800">
          Bu ilan {dateFmt.format(gig.sponsoredUntil!)} tarihine kadar zaten öne çıkarılmış. Şimdi alırsan{" "}
          {days} gün bu tarihin üzerine eklenir.
        </p>
      )}

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage ?? tokenError}</p>
      )}

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            isPaytrTestMode ? undefined : isMockPayment ? (
              <ProMockCheckoutForm
                amount={price}
                onComplete={completeMockBoostPayment.bind(null, gigId)}
                onFail={failMockBoostPayment.bind(null, gigId)}
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
              onNotify={notifyBoostBankTransferAction.bind(null, gigId)}
              activatesLabel="öne çıkarma"
            />
          }
        />
      </div>
    </div>
  );
}
