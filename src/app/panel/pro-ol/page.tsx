import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayment, isPaytrTestMode, getPaytrToken, clientIp } from "@/lib/paytr";
import { findOrCreatePendingProPurchase, PRO_PRICE_TL } from "@/lib/pro-purchase";
import { formatPrice } from "@/lib/format-price";
import { ProMockCheckoutForm } from "./pro-mock-checkout-form";
import { PaytrEmbed } from "@/app/odeme/[orderId]/paytr-embed";

const benefitsByRole: Record<"BUYER" | "FREELANCER", string[]> = {
  BUYER: [
    "Kategoriler sayfasında “Sadece Pro freelancer'ları göster” filtresini kullan",
    "Panelinde Pro rozeti görünür",
  ],
  FREELANCER: [
    "İlanlarında ve profilinde Pro rozeti görünür",
    "Alıcılar “Sadece Pro freelancer'ları göster” filtresiyle seni bulur",
  ],
};

export default async function ProOlPage(props: PageProps<"/panel/pro-ol">) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol");
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

  const role = session.user.role as "BUYER" | "FREELANCER";
  const purchase = await findOrCreatePendingProPurchase(session.user.id);

  let paytrToken: string | null = null;
  let tokenError: string | null = null;

  // Card is Pro's only payment method (no Havale/EFT alternative), so — unlike order
  // checkout — PayTR test mode cannot fall back to hiding just the card option: there
  // would be nothing left to offer. It shows the "coming soon" panel below instead, and
  // starts working the moment PAYTR_TEST_MODE=0 goes live, no code change needed.
  if (!isMockPayment && !isPaytrTestMode) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    try {
      paytrToken = await getPaytrToken({
        merchantOid: purchase.id,
        email: user.email,
        amount: PRO_PRICE_TL,
        userIp: await clientIp(),
        userName: user.name,
        userAddress: "Prosinta, Türkiye",
        userPhone: "05000000000",
        basket: [{ name: "Prosinta Pro üyelik", price: PRO_PRICE_TL, quantity: 1 }],
        okUrl: `${appUrl}/panel`,
        failUrl: `${appUrl}/panel/pro-ol?hata=odeme-basarisiz`,
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-navy">Prosinta Pro Ol</h1>
        <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
          Pro
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Tek seferlik {formatPrice(PRO_PRICE_TL)}₺ ile süresiz Prosinta Pro üyeliğine geç.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        {benefitsByRole[role].map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span> {benefit}
          </li>
        ))}
      </ul>

      {(errorMessage || tokenError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage ?? tokenError}
        </p>
      )}

      <div className="mt-8">
        {isMockPayment ? (
          <ProMockCheckoutForm amount={PRO_PRICE_TL} />
        ) : isPaytrTestMode ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            Pro üyelik satın alma yakında açılıyor.
          </p>
        ) : paytrToken ? (
          <PaytrEmbed token={paytrToken} />
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            Pro&apos;ya geçiş şu anda başlatılamıyor, biraz sonra tekrar dene.
          </p>
        )}
      </div>
    </div>
  );
}
