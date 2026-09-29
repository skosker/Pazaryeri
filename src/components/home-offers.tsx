import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getOpenCampaigns, campaignStatus } from "@/lib/campaign";
import { budgetLabel, openRequestWhere } from "@/lib/job-requests";

const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

type Offer = {
  key: string;
  tone: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
};

/**
 * "Fırsatlar" on the home page: whatever is switched on in /admin/ayarlar and
 * /admin/kampanyalar right now, so a card appears and disappears with its campaign.
 */
export async function HomeOffers() {
  const [settings, campaigns] = await Promise.all([getSettings(), getOpenCampaigns()]);
  const now = new Date();
  const offers: Offer[] = [];

  const campaign = campaigns[0];
  if (campaign) {
    const live = campaignStatus(campaign, now) === "yayinda";
    const daysLeft = Math.max(1, Math.ceil((campaign.end.getTime() - now.getTime()) / 86_400_000));
    offers.push(
      live
        ? {
            key: "kampanya",
            tone: "from-rose-600 via-fuchsia-600 to-indigo-600 text-white",
            eyebrow: daysLeft <= 1 ? "Son gün" : `Bitmesine ${daysLeft} gün`,
            title: `${campaign.name} başladı`,
            text: campaign.tagline ?? `Katılan ilanlarda en fazla %${campaign.maxPercent} indirim.`,
            cta: "İndirimli Hizmetler",
            href: "/kampanya",
          }
        : {
            key: "kampanya",
            tone: "from-rose-600 via-fuchsia-600 to-indigo-600 text-white",
            eyebrow: `Yakında · ${dayFmt.format(campaign.start)}`,
            title: campaign.name,
            text: "Freelancer'lar ilanlarını şimdiden kampanyaya ekleyebilir; katılan ilanlar kampanya boyunca öne çıkar.",
            cta: "İlanını Ekle",
            href: "/panel/kampanyalar",
          }
    );
  }
  if (settings.firstOrderEnabled && settings.firstOrderPercent > 0) {
    offers.push({
      key: "ilk-siparis",
      tone: "from-emerald-50 to-white text-brand-navy ring-1 ring-emerald-100",
      eyebrow: "Yeni üyelere",
      title: `İlk siparişine %${settings.firstOrderPercent.toLocaleString("tr-TR")} indirim`,
      text: `En fazla ${tl(settings.firstOrderMaxTl)}. Kod gerekmez, indirim ödeme sayfasında kendiliğinden düşer.`,
      cta: "Hizmetleri Keşfet",
      href: "/kategoriler",
    });
  }
  if (settings.referralEnabled && settings.referralRewardTl > 0) {
    offers.push({
      key: "davet",
      tone: "from-amber-50 to-white text-brand-navy ring-1 ring-amber-100",
      eyebrow: "Davet et, kazan",
      title: `Her arkadaşın için ${tl(settings.referralRewardTl)}`,
      text: "Davet bağlantınla gelen arkadaşının ilk siparişi tamamlanınca ödülün hesabına tanımlanır.",
      cta: "Davet Et",
      href: "/panel/davet",
    });
  }
  if (offers.length === 0) return null;

  return (
    // Pulled up over the bottom of the hero: the heading sits on the navy and the cards
    // straddle its edge, so the grey starts exactly where the hero ends (top-24 / top-28
    // match the -mt below).
    <section className="relative z-10 -mt-24 lg:-mt-28">
      <div aria-hidden className="absolute inset-x-0 bottom-0 top-24 bg-slate-50 lg:top-28" />
      <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Fırsatlar</h2>
        <div className={`mt-6 grid grid-cols-1 gap-4 ${offers.length === 3 ? "lg:grid-cols-3" : offers.length === 2 ? "md:grid-cols-2" : ""}`}>
          {offers.map((o) => {
            const dark = o.key === "kampanya";
            return (
              <Link
                key={o.key}
                href={o.href}
                className={`group flex flex-col rounded-2xl bg-gradient-to-br p-6 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl ${o.tone}`}
              >
                <span className={`text-xs font-bold uppercase tracking-wide ${dark ? "text-white/80" : "text-purple-600"}`}>
                  {o.eyebrow}
                </span>
                <span className="mt-2 text-xl font-extrabold">{o.title}</span>
                <span className={`mt-2 text-sm ${dark ? "text-white/80" : "text-slate-600"}`}>{o.text}</span>
                <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${dark ? "text-white" : "text-purple-700"}`}>
                  {o.cta}
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** "Aradığını bulamadın mı?" plus the newest open requests, while İş Talepleri is on. */
export async function HomeJobRequests() {
  const settings = await getSettings();
  if (!settings.jobRequestsEnabled) return null;
  const requests = await prisma.jobRequest.findMany({
    where: openRequestWhere(),
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true, title: true, budgetMin: true, budgetMax: true, deliveryDays: true,
      category: { select: { name: true } },
      _count: { select: { offers: { where: { status: { not: "WITHDRAWN" } } } } },
    },
  });

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-purple-600">İş Talepleri</span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
            Aradığını bulamadın mı? Teklifler sana gelsin.
          </h2>
          <p className="mt-3 text-slate-600">
            Ne yaptırmak istediğini ve bütçeni yaz; freelancer&apos;lar fiyat ve süreyle teklif versin. Talep açmak ücretsiz.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/panel/is-taleplerim/yeni"
              className="brand-gradient rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              İş Talebi Aç
            </Link>
            <Link href="/is-talepleri" className="text-sm font-semibold text-purple-700 hover:underline">
              Açık Talepleri Gör →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/is-talepleri/${r.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-purple-200 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-semibold text-brand-navy sm:truncate">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.category.name} · {r.deliveryDays} gün ·{" "}
                      {r._count.offers > 0 ? `${r._count.offers} teklif` : "İlk teklifi sen ver"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-navy">{budgetLabel(r.budgetMin, r.budgetMax)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["Talebini yaz", "İşi, bütçeni ve teslim süreni anlat."],
                ["Teklifleri al", "Freelancer'lar fiyat, süre ve ön yazıyla teklif verir."],
                ["Seç ve başla", "Beğendiğini kabul et; ödemen Prosinta güvencesinde."],
              ].map(([title, text], i) => (
                <li key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <span className="brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-3 font-semibold text-brand-navy">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
