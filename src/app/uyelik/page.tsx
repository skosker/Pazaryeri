import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { buildPlanCards } from "@/lib/membership-plans";
import { MembershipPlans } from "@/components/membership-plans";

export const metadata: Metadata = {
  title: "Freelancer Üyelik Paketleri",
  description:
    "Prosinta Pro ve Pro Plus: aramalarda öncelik, rozet, ücretsiz Öne Çıkar ve daha fazlası. Aylık ya da yıllık, yıllıkta tasarruflu.",
};

export default async function UyelikPage() {
  const session = await auth();
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null;
  // A signed-in freelancer starts the trial and buys from the panel page.
  const { plans, yearlyDiscountPercent, campaignNote } = await buildPlanCards(viewer, "/panel/pro-ol");

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">Freelancer Üyelik Paketleri</h1>
          <p className="mt-3 text-slate-600">
            Daha çok görün, daha çok iş al. Yıllık planda %{yearlyDiscountPercent.toLocaleString("tr-TR")}{" "}
            tasarruf et; paketini istediğin zaman yükselt, kalan süren yeni paketine aktarılır.
          </p>
        </div>

        <div className="mt-10">
          <MembershipPlans plans={plans} yearlyDiscountPercent={yearlyDiscountPercent} campaignNote={campaignNote} />
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Üyelikler otomatik yenilenmez; süren bitince ücretsiz pakete dönersin, ilanların yayında kalır.{" "}
          <Link href="/destek" className="font-semibold text-purple-700 hover:underline">
            Sık Sorulan Sorular
          </Link>
        </p>
      </div>
    </div>
  );
}
