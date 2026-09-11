import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, getPaytrToken } from "@/lib/paytr";
import { MockCheckoutForm } from "./mock-checkout-form";
import { PaytrEmbed } from "./paytr-embed";
import { PaymentMethodTabs } from "./payment-method-tabs";
import { BankTransferPanel } from "./bank-transfer-panel";
import { getBankAccounts } from "@/lib/bank-transfer";

/** The buyer's real IP — PayTR hashes it into the token request and can reject a
 * mismatched one, unlike iyzico's sandbox, which never checked the placeholder this
 * codebase used to send. `x-forwarded-for` can carry a proxy chain; the first entry is
 * the original client. */
async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "127.0.0.1";
}

export default async function CheckoutPage(props: PageProps<"/odeme/[orderId]">) {
  const { orderId } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: true, package: true, buyer: true },
  });

  if (!order) notFound();
  if (order.buyerId !== session.user.id) notFound();
  if (order.status !== "PENDING_PAYMENT") redirect(`/siparis/${orderId}`);

  const amount = Number(order.amount);
  const bankAccounts = await getBankAccounts();
  const errorMessage = searchParams.hata === "odeme-basarisiz" ? "Ödeme başarısız oldu, tekrar deneyin." : null;

  let paytrToken: string | null = null;
  let tokenError: string | null = null;

  if (!isMockPayment) {
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

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            isMockPayment ? (
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
