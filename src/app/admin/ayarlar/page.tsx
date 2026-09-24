import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { MembershipSettingsForm } from "./settings-form";
import { plusMemberWhere, proMemberWhere } from "@/lib/membership";

export default async function MembershipSettingsPage() {
  const now = new Date();
  const [settings, founders, sponsored, pros, pluses, companies] = await Promise.all([
    getSettings(),
    prisma.user.count({ where: { founderNumber: { not: null } } }),
    prisma.gig.count({ where: { sponsoredUntil: { gt: now } } }),
    prisma.user.count({ where: { ...proMemberWhere(now), synthetic: false } }),
    prisma.user.count({ where: { ...plusMemberWhere(now), synthetic: false } }),
    prisma.user.count({ where: { companyName: { not: null } } }),
  ]);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Üyelik ve Gelir Ayarları</h1>
          <p className="mt-1 text-sm text-slate-500">Kaydettiğin değerler sitede hemen geçerli olur.</p>
        </div>
        <Link href="/admin/kampanyalar" className="text-sm font-semibold text-purple-700 hover:underline">
          Kampanyalar →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Kurucu Freelancer" value={`${founders.toLocaleString("tr-TR")} / ${settings.founderLimit.toLocaleString("tr-TR")}`} />
        <Stat label="Sponsorlu ilan" value={String(sponsored)} />
        <Stat label="Pro / Pro Plus üye" value={`${pros - pluses} / ${pluses}`} />
        <Stat label="Kurumsal hesap" value={String(companies)} />
      </div>

      <div className="mt-6">
        <MembershipSettingsForm settings={settings} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-navy">{value}</p>
    </div>
  );
}
