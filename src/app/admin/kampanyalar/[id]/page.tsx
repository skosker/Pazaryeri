import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { campaignStatus, campaignStatusLabel } from "@/lib/campaign";
import { toIstanbulInput } from "@/app/admin/settings-fields";
import { CampaignForm } from "../campaign-form";
import { deleteCampaignAction, resetCampaignEntriesAction } from "../actions";
import { announcementAudience } from "@/lib/campaign-announce";

const sentFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" });

export default async function EditCampaignPage(props: PageProps<"/admin/kampanyalar/[id]">) {
  const { id } = await props.params;
  const isNew = id === "yeni";
  const campaign = isNew
    ? null
    : await prisma.campaign.findUnique({ where: { id }, include: { _count: { select: { entries: true } } } });
  if (!isNew && !campaign) notFound();
  const audience = await prisma.user.count({ where: announcementAudience });

  return (
    <div className="max-w-5xl">
      <Link href="/admin/kampanyalar" className="text-sm text-slate-500 hover:text-brand-navy">
        ← Kampanyalar
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-navy">{campaign ? campaign.name : "Yeni Kampanya"}</h1>
        {campaign && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">
              {campaignStatusLabel[campaignStatus(campaign)]} · {campaign._count.entries} ilan katıldı
            </span>
            <Link href={`/kampanya?onizleme=${campaign.id}`} className="font-semibold text-purple-700 hover:underline">
              Önizle →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <CampaignForm
          id={campaign?.id ?? null}
          announcement={{
            sentLabel: campaign?.announcedAt
              ? `${sentFmt.format(campaign.announcedAt)} · ${(campaign.announcedCount ?? 0).toLocaleString("tr-TR")} kişi`
              : null,
            audience,
          }}
          values={
            campaign
              ? {
                  name: campaign.name,
                  tagline: campaign.tagline,
                  enabled: campaign.enabled,
                  start: toIstanbulInput(campaign.start),
                  end: toIstanbulInput(campaign.end),
                  minPercent: campaign.minPercent,
                  maxPercent: campaign.maxPercent,
                  proDiscountPercent: campaign.proDiscountPercent,
                  boostDiscountPercent: campaign.boostDiscountPercent,
                }
              : {
                  name: "",
                  tagline: null,
                  enabled: false,
                  start: "",
                  end: "",
                  minPercent: 10,
                  maxPercent: 50,
                  proDiscountPercent: 0,
                  boostDiscountPercent: 0,
                }
          }
        />
      </div>

      {campaign && (
        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-5 text-xs">
          {campaign._count.entries > 0 && (
            <form action={resetCampaignEntriesAction.bind(null, campaign.id)}>
              <button className="rounded-full border border-slate-300 px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                Katılımları Sıfırla
              </button>
            </form>
          )}
          <form action={deleteCampaignAction.bind(null, campaign.id)}>
            <button className="rounded-full bg-red-50 px-4 py-1.5 font-semibold text-red-600 hover:bg-red-100">
              Kampanyayı Sil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
