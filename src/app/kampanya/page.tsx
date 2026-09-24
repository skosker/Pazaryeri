import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCampaignPricing, previewCampaignPricing } from "@/lib/campaign";
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
 * The live campaign's showcase. Before (or without) one, only an admin can open it — as a
 * preview of a chosen campaign (?onizleme=<id>) with its sign-ups priced as if live;
 * everyone else gets a 404, so nothing leaks early.
 */
export default async function CampaignPage(props: PageProps<"/kampanya">) {
  const { onizleme } = await props.searchParams;
  let pricing = await getCampaignPricing();
  let preview = false;

  if (typeof onizleme === "string" || !pricing.campaign) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      if (!pricing.campaign) notFound();
    } else if (typeof onizleme === "string") {
      pricing = await previewCampaignPricing(onizleme);
      preview = true;
    }
  }
  const campaign = pricing.campaign;
  if (!campaign) notFound();

  const cards = await listCampaignGigs(pricing);

  return (
    <div>
      {preview && (
        <p className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
          Önizleme — bu sayfayı yalnızca adminler görüyor; katılan ilanlar kampanya yayındaymış gibi gösteriliyor.
        </p>
      )}
      <section className="bg-gradient-to-br from-rose-600 via-fuchsia-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold sm:text-5xl">{campaign.name}</h1>
          <p className="mt-3 text-white/90">
            {campaign.tagline ?? "Freelancer'ların kendi belirlediği indirimlerle, Prosinta güvencesinde."}
          </p>
          <p className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
            {dateFmt.format(campaign.start)} – {dateFmt.format(campaign.end)}
          </p>
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
