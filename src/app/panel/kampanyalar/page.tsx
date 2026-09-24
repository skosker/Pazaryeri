import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { campaignPrice, campaignStatus, getOpenCampaigns } from "@/lib/campaign";
import { formatPrice } from "@/lib/format-price";
import { joinCampaignAction, leaveCampaignAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export default async function FreelancerCampaignsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/kampanyalar");
  if (session.user.role !== "FREELANCER") redirect("/panel");

  const campaigns = await getOpenCampaigns();
  const gigs = await prisma.gig.findMany({
    where: { sellerId: session.user.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      published: true,
      packages: { orderBy: { price: "asc" }, take: 1, select: { price: true } },
      campaignEntries: {
        where: { campaignId: { in: campaigns.map((c) => c.id) } },
        select: { campaignId: true, percent: true },
      },
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-navy">Kampanyalar</h1>
      <p className="mt-1 text-sm text-slate-500">
        İlanlarını kampanyalara kendi belirlediğin indirimle katabilirsin. İndirimi sen karşılarsın; kampanya süresince
        ilanın indirimli fiyat ve kampanya rozetiyle gösterilir, kampanya sayfasında listelenir.
      </p>

      {campaigns.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Şu an katılım açık bir kampanya yok.
        </p>
      ) : (
        campaigns.map((c) => {
          const options = Array.from({ length: Math.floor((c.maxPercent - c.minPercent) / 5) + 1 }, (_, i) => c.minPercent + i * 5);
          return (
            <section key={c.id} className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-rose-700">{c.name}</h2>
                  {c.tagline && <p className="text-sm text-slate-500">{c.tagline}</p>}
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {campaignStatus(c) === "yayinda" ? "Yayında" : "Yakında"} · {dateFmt.format(c.start)} – {dateFmt.format(c.end)}
                </span>
              </div>
              {(c.proDiscountPercent > 0 || c.boostDiscountPercent > 0) && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                  Kampanya süresince sana özel:
                  {c.proDiscountPercent > 0 && ` Pro üyelik %${c.proDiscountPercent} indirimli`}
                  {c.proDiscountPercent > 0 && c.boostDiscountPercent > 0 && ","}
                  {c.boostDiscountPercent > 0 && ` Öne Çıkar %${c.boostDiscountPercent} indirimli`}.
                </p>
              )}

              {gigs.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Katılmak için onaylı bir ilanın olmalı.{" "}
                  <Link href="/panel/ilan-olustur" className="font-semibold text-purple-700 hover:underline">
                    İlan oluştur
                  </Link>
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {gigs.map((gig) => {
                    const entry = gig.campaignEntries.find((e) => e.campaignId === c.id);
                    const price = Number(gig.packages[0]?.price ?? 0);
                    return (
                      <li key={gig.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-navy">{gig.title}</p>
                          <p className="text-xs text-slate-400">
                            {formatPrice(price)} TL
                            {entry && ` → kampanyada ${formatPrice(campaignPrice(price, entry.percent))} TL`}
                            {!gig.published && " · duraklatılmış"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <form
                            key={entry?.percent ?? "yok"}
                            action={joinCampaignAction.bind(null, c.id, gig.id)}
                            className="flex items-center gap-1"
                          >
                            <select
                              name="percent"
                              defaultValue={entry?.percent ?? c.minPercent}
                              aria-label={`${c.name} indirimi`}
                              className="rounded-full border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700"
                            >
                              {options.map((p) => (
                                <option key={p} value={p}>
                                  %{p}
                                </option>
                              ))}
                            </select>
                            <button className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
                              {entry ? "İndirimi Güncelle" : "Kampanyaya Katıl"}
                            </button>
                          </form>
                          {entry && (
                            <form action={leaveCampaignAction.bind(null, c.id, gig.id)}>
                              <button className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                                Ayrıl
                              </button>
                            </form>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
