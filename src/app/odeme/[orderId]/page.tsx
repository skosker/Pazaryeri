import { randomUUID } from "crypto";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, initializeCheckoutForm } from "@/lib/iyzico";
import { MockCheckoutForm } from "./mock-checkout-form";
import { IyzicoEmbed } from "./iyzico-embed";
import { PaymentMethodTabs } from "./payment-method-tabs";
import { BankTransferPanel } from "./bank-transfer-panel";
import { getBankAccounts } from "@/lib/bank-transfer";
import type { Prisma } from "@/generated/prisma/client";

export default async function CheckoutPage(props: PageProps<"/odeme/[orderId]">) {
  const { orderId } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/odeme/${orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: { include: { category: true } }, package: true },
  });

  if (!order) notFound();
  if (order.buyerId !== session.user.id) notFound();
  if (order.status !== "PENDING_PAYMENT") redirect(`/siparis/${orderId}`);

  const amount = Number(order.amount);
  const bankAccounts = await getBankAccounts();
  const errorMessage = searchParams.hata === "odeme-basarisiz" ? "Ödeme başarısız oldu, tekrar deneyin." : null;

  let checkoutFormContent: string | null = null;

  if (!isMockPayment) {
    const conversationId = randomUUID();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const result = await initializeCheckoutForm({
      conversationId,
      price: amount,
      basketId: order.id,
      callbackUrl: `${appUrl}/api/payment/callback`,
      buyer: {
        id: session.user.id,
        name: session.user.name ?? "Alıcı",
        surname: session.user.name?.split(" ").slice(-1)[0] ?? "Alıcı",
        email: session.user.email ?? "buyer@demo.prosinta.com",
        ip: "85.34.78.112",
      },
      item: {
        id: order.package.id,
        name: order.gig.title,
        category: order.gig.category.name,
      },
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        conversationId,
        token: String(result.token ?? ""),
        rawResponse: result as unknown as Prisma.InputJsonValue,
      },
      update: {
        conversationId,
        token: String(result.token ?? ""),
        rawResponse: result as unknown as Prisma.InputJsonValue,
      },
    });

    checkoutFormContent = String(result.checkoutFormContent ?? "");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Siparişi Tamamla</h1>
      <p className="mt-1 text-sm text-slate-500">{order.package.name} · {order.gig.title}</p>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="mt-6">
        <PaymentMethodTabs
          cardContent={
            isMockPayment ? (
              <MockCheckoutForm orderId={order.id} amount={amount} />
            ) : (
              <IyzicoEmbed checkoutFormContent={checkoutFormContent ?? ""} />
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
