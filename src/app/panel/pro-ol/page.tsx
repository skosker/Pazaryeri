import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { becomeProBuyerAction } from "./actions";

export default async function ProOlPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/pro-ol");
  if (session.user.role !== "BUYER") redirect("/panel");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (user?.isPro) redirect("/panel");

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-navy">Prosinta Pro Ol</h1>
        <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
          Pro
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Profilinde Pro rozeti taşı ve hizmet ararken sadece admin onaylı Pro freelancer&apos;ları
        filtreleme ayrıcalığı kazan.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Kategoriler sayfasında &quot;Sadece Pro
          freelancer&apos;ları göster&quot; filtresini kullan
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Panelinde Pro rozeti görünür
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Ücretsiz, dilediğin zaman devam edebilirsin
        </li>
      </ul>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={becomeProBuyerAction}>
          <button
            type="submit"
            className="brand-gradient w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Prosinta Pro&apos;ya Geç
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-400">
          Bu demo ortamında ücretsiz bir rozet ve filtre özelliğidir.
        </p>
      </div>
    </div>
  );
}
