import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const now = new Date();
  const [settings, founders, sponsored, pros] = await Promise.all([
    getSettings(),
    prisma.user.count({ where: { founderNumber: { not: null } } }),
    prisma.gig.count({ where: { sponsoredUntil: { gt: now } } }),
    prisma.user.count({ where: { isPro: true, synthetic: false } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-navy">Kampanya ve Üyelik Ayarları</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fiyatlar, süreler ve kampanyalar. Kaydettiğin değerler sitede hemen geçerli olur, yeni bir
        dağıtım gerekmez.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-xl bg-purple-50 px-4 py-2 text-purple-800">
          Kurucu Freelancer: <strong>{founders.toLocaleString("tr-TR")}</strong> / {settings.founderLimit.toLocaleString("tr-TR")}
        </span>
        <span className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700">
          Şu an sponsorlu ilan: <strong>{sponsored}</strong>
        </span>
        <span className="rounded-xl bg-amber-50 px-4 py-2 text-amber-800">
          Pro üye (gerçek): <strong>{pros}</strong>
        </span>
      </div>

      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
