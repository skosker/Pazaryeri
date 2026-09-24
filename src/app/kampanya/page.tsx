import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCampaign } from "@/lib/campaign";
import { listCampaignGigs } from "@/lib/gigs";
import { GigCard } from "@/components/gig-card";

export const metadata: Metadata = { title: "Kampanya" };

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

/**
 * The seasonal campaign's showcase. Only there while the campaign is live; before that an
 * admin can open it as a preview (with every sign-up shown as if it had started), and
 * everyone else gets a 404, so nothing leaks early.
 */
export default async function CampaignPage() {
  const campaign = await getCampaign();
  let preview = false;
  if (!campaign.live) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") notFound();
    preview = true;
  }

  const cards = await listCampaignGigs({ ...campaign, live: true });

  return (
    <div>
      {preview && (
        <p className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
          Önizleme — kampanya {campaign.enabled ? "henüz başlamadı" : "kapalı"}; bu sayfayı yalnızca adminler görüyor.
        </p>
      )}
      <section className="bg-gradient-to-br from-rose-600 via-fuchsia-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold sm:text-5xl">{campaign.name}</h1>
          <p className="mt-3 text-white/90">
            Freelancer&apos;ların kendi belirlediği indirimlerle, Prosinta güvencesinde.
          </p>
          {campaign.start && campaign.end && (
            <p className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
              {dateFmt.format(campaign.start)} – {dateFmt.format(campaign.end)}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {cards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Henüz kampanyaya katılan ilan yok.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((gig) => (
              <GigCard key={gig.slug} gig={gig} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
