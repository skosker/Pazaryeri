import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isMockPaymentAllowed, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { MockCheckoutForm } from "./mock-checkout-form";
import { PaytrEmbed } from "./paytr-embed";
import { PaymentMethodTabs } from "./payment-method-tabs";
import { BankTransferPanel } from "./bank-transfer-panel";
import { getBankAccounts } from "@/lib/bank-transfer";
import { NOT_TAKING_ORDERS, payableAmount, refreshOrderDiscounts, sellerTakesOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format-price";
import Link from "next/link";
import { corporateAccount } from "@/lib/corporate";
import { payWithBalanceAction } from "./actions";

export default async function CheckoutPage(props: PageProps<"/odeme/[orderId]">) {
  const { orderId } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      gig: { include: { seller: { select: { synthetic: true, suspended: true } } } },
      package: true,
      buyer: true,
    },
  });

  if (!order) notFound();
  if (order.buyerId !== session.user.id) notFound();
  if (order.status !== "PENDING_PAYMENT") redirect(`/siparis/${orderId}`);
  // An unpaid order left over from before the seller stopped taking orders must not be paid.
  if (!sellerTakesOrders(order.gig.seller)) {
    redirect(`/gig/${order.gig.slug}?hata=${encodeURIComponent(NOT_TAKING_ORDERS)}`);
  }

  const listPrice = Number(order.amount);
  const { discount, creditDiscount } = await refreshOrderDiscounts(order);
  // What is actually charged — card, bank transfer and the summary below all use this.
  const amount = payableAmount({ amount: listPrice, discount, creditDiscount });
  const bankAccounts = await getBankAccounts();
  const errorMessage =
    searchParams.hata === "odeme-basarisiz"
      ? "Ödeme başarısız oldu, tekrar deneyin."
      : typeof searchParams.hata === "string"
        ? searchParams.hata
        : null;
  const corporate = await corporateAccount(session.user.id);

  let paytrToken: string | null = null;
  let tokenError: string | null = null;

  if (!isMockPayment && !isPaytrTestMode) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    // PayTR requires an alphanumeric merchant_oid; the cuid order id already is one,
    // but this strips anything that isn't just in case.
    const merchantOid = order.id.replace(/[^a-zA-Z0-9]/g, "");

    try {
      paytrToken = await getPaytrToken({
        merchantOid,
        email: order.buyer.email,
        amount,
        userIp: await clientIp(),
        userName: order.buyer.name,
        userAddress: "Prosinta, Türkiye",
        userPhone: "05000000000",
        basket: [{ name: order.gig.title.slice(0, 100), price: amount, quantity: 1 }],
        okUrl: `${appUrl}/siparis/${order.id}`,
        failUrl: `${appUrl}/odeme/${order.id}?hata=odeme-basarisiz`,
      });

      await prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          provider: "paytr",
          orderId: order.id,
          conversationId: merchantOid,
          token: paytrToken,
        },
        update: {
          provider: "paytr",
          conversationId: merchantOid,
          token: paytrToken,
          status: "INITIALIZED",
        },
      });
    } catch (error) {
      tokenError = error instanceof Error ? error.message : "Ödeme başlatılamadı";
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Siparişi Tamamla</h1>
      <p className="mt-1 text-sm text-slate-500">{order.package.name} · {order.gig.title}</p>

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage ?? tokenError}
        </p>
      )}

      {(discount > 0 || creditDiscount > 0) && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Paket fiyatı</span>
            <span>{formatPrice(listPrice)} TL</span>
          </div>
          {discount > 0 && (
            <div className="mt-1 flex justify-between font-semibold text-emerald-700">
              <span>İlk sipariş indirimi</span>
              <span>−{formatPrice(discount)} TL</span>
            </div>
          )}
          {creditDiscount > 0 && (
            <div className="mt-1 flex justify-between font-semibold text-emerald-700">
              <span>Davet ödülü</span>
              <span>−{formatPrice(creditDiscount)} TL</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-emerald-200 pt-2 font-bold text-brand-navy">
            <span>Ödenecek tutar</span>
            <span>{formatPrice(amount)} TL</span>
          </div>
        </div>
      )}

      {corporate.usable && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-navy">Kurumsal Bakiye ile Öde</p>
              <p className="text-sm text-slate-600">
                Bakiyen: <strong>{formatPrice(corporate.balance)} TL</strong>
              </p>
            </div>
            {corporate.balance >= amount ? (
              <form action={payWithBalanceAction.bind(null, order.id)}>
                <button
                  type="submit"
                  className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  {formatPrice(amount)} TL Bakiyeden Öde
                </button>
              </form>
            ) : (
              <Link href="/panel/kurumsal" className="text-sm font-semibold text-purple-700 hover:underline">
                Bakiye yetersiz — bakiye yükle →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            isPaytrTestMode || (isMockPayment && !isMockPaymentAllowed) ? undefined : isMockPayment ? (
              <MockCheckoutForm orderId={order.id} amount={amount} />
            ) : paytrToken ? (
              <PaytrEmbed token={paytrToken} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                Kart ile ödeme şu anda başlatılamıyor, lütfen Havale/EFT ile devam edin.
              </p>
            )
          }
          bankContent={<BankTransferPanel orderId={order.id} amount={amount} accounts={bankAccounts} />}
        />
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Ödemen Prosinta güvencesiyle korunur, iş onaylanmadan satıcıya aktarılmaz.
      </p>
    </div>
  );
}
