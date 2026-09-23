import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { findOrCreatePendingProPurchase } from "@/lib/pro-purchase";
import { getBankAccounts } from "@/lib/bank-transfer";
import { formatPrice } from "@/lib/format-price";
import { ProMockCheckoutForm } from "./pro-mock-checkout-form";
import { ProBankTransferPanel } from "./pro-bank-transfer-panel";
import { PaymentMethodTabs } from "@/app/odeme/[orderId]/payment-method-tabs";
import { PaytrEmbed } from "@/app/odeme/[orderId]/paytr-embed";

export default async function ProOdemePage(props: PageProps<"/panel/pro-ol/odeme">) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol/odeme");
  if (session.user.role !== "BUYER" && session.user.role !== "FREELANCER") redirect("/panel");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, email: true, name: true },
  });
  if (!user) redirect("/panel");
  if (user.isPro) redirect("/panel");

  const searchParams = await props.searchParams;
  const errorMessage =
    searchParams.hata === "odeme-basarisiz" ? "Ödeme başarısız oldu, tekrar deneyin." : null;

  const [purchase, bankAccounts] = await Promise.all([
    findOrCreatePendingProPurchase(session.user.id),
    getBankAccounts(),
  ]);

  const price = Number(purchase.amount);
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
        basket: [{ name: "Prosinta Pro üyelik", price: price, quantity: 1 }],
        okUrl: `${appUrl}/panel`,
        failUrl: `${appUrl}/panel/pro-ol/odeme?hata=odeme-basarisiz`,
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
      <h1 className="text-2xl font-bold text-brand-navy">Pro Üyeliği Tamamla</h1>
      <p className="mt-1 text-sm text-slate-500">Tek seferlik {formatPrice(price)}₺</p>

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage ?? tokenError}
        </p>
      )}

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            // Unlike order checkout, Pro's card option cannot fall back to hiding just
            // itself while PayTR is in test mode without anything shown at all — Havale/
            // EFT is offered here too, so hiding the card tab has a real alternative next
            // to it, same as orders.
            isPaytrTestMode ? undefined : isMockPayment ? (
              <ProMockCheckoutForm amount={price} />
            ) : paytrToken ? (
              <PaytrEmbed token={paytrToken} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                Kart ile ödeme şu anda başlatılamıyor, lütfen Havale/EFT ile devam edin.
              </p>
            )
          }
          bankContent={<ProBankTransferPanel amount={price} accounts={bankAccounts} />}
        />
      </div>
    </div>
  );
}
