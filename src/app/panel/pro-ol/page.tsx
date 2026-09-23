import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format-price";
import { getSettings, type SiteSettings } from "@/lib/settings";

const benefitsByRole = (settings: SiteSettings): Record<"BUYER" | "FREELANCER", string[]> => ({
  BUYER: [
    "Kategoriler sayfasında “Sadece Pro freelancer'ları göster” filtresini kullan",
    "Panelinde Pro rozeti görünür",
  ],
  FREELANCER: [
    "İlanların aramalarda öne çıkar (varsayılan sıralamada Pro olmayanların önünde)",
    `İlan başına ${settings.portfolioImages} yerine ${settings.portfolioImagesPro} örnek iş görseli ekleyebilirsin`,
    "İlanlarında ve profilinde Pro rozeti görünür",
    "Alıcılar “Sadece Pro freelancer'ları göster” filtresiyle seni bulur",
  ],
});

export default async function ProOlPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol");
  if (session.user.role !== "BUYER" && session.user.role !== "FREELANCER") redirect("/panel");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user) redirect("/panel");
  if (user.isPro) redirect("/panel");

  const role = session.user.role as "BUYER" | "FREELANCER";
  const settings = await getSettings();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-navy">Prosinta Pro Ol</h1>
        <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
          Pro
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Tek seferlik {formatPrice(settings.proPriceTl)}₺ ile süresiz Prosinta Pro üyeliğine geç.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        {benefitsByRole(settings)[role].map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span> {benefit}
          </li>
        ))}
      </ul>

      <Link
        href="/panel/pro-ol/odeme"
        className="brand-gradient mt-8 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Pro Ol
      </Link>
    </div>
  );
}
