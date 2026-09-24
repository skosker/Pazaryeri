import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { campaignStatus, campaignStatusLabel } from "@/lib/campaign";
import { OfferSettingsForm } from "./offer-settings-form";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});
const statusTone = {
  kapali: "bg-slate-100 text-slate-500",
  yakinda: "bg-amber-50 text-amber-700",
  yayinda: "bg-emerald-50 text-emerald-700",
  bitti: "bg-slate-100 text-slate-400",
} as const;

export default async function CampaignsAdminPage() {
  const [settings, campaigns] = await Promise.all([
    getSettings(),
    prisma.campaign.findMany({ orderBy: { start: "asc" }, include: { _count: { select: { entries: true } } } }),
  ]);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Kampanyalar</h1>
          <p className="mt-1 text-sm text-slate-500">Sürekli indirimler ve tarihli kampanyalar.</p>
        </div>
        <Link href="/admin/ayarlar" className="text-sm font-semibold text-purple-700 hover:underline">
          ← Üyelik ve Gelir Ayarları
        </Link>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-navy">Tarihli Kampanyalar</h2>
          <Link
            href="/admin/kampanyalar/yeni"
            className="brand-gradient rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Yeni Kampanya
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Henüz kampanya yok.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Kampanya</th>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">İndirim</th>
                  <th className="px-5 py-3 font-medium">Katılan</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const status = campaignStatus(c);
                  return (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-4 font-medium text-brand-navy">{c.name}</td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {dateFmt.format(c.start)}
                        <br />
                        {dateFmt.format(c.end)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        İlan %{c.minPercent}–%{c.maxPercent}
                        {(c.proDiscountPercent > 0 || c.boostDiscountPercent > 0) && (
                          <span className="block text-slate-400">
                            Pro %{c.proDiscountPercent} · Öne Çıkar %{c.boostDiscountPercent}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{c._count.entries} ilan</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[status]}`}>
                          {campaignStatusLabel[status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3 text-xs font-semibold">
                          <Link href={`/kampanya?onizleme=${c.id}`} className="text-slate-500 hover:underline">
                            Önizle
                          </Link>
                          <Link href={`/admin/kampanyalar/${c.id}`} className="text-purple-700 hover:underline">
                            Düzenle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-brand-navy">Sürekli İndirimler</h2>
        <OfferSettingsForm settings={settings} />
      </section>
    </div>
  );
}
