import { CORP_PLAN_SLUG, corpPerks, corpPlanPrice, corporatePlanState, type CorpPlan } from "@/lib/corporate-plans";
import type { PlanCardData, PlanFeature } from "@/components/membership-plans";
import type { SiteSettings } from "@/lib/settings";

const pct = (n: number) => `%${n.toLocaleString("tr-TR")}`;
const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

function planFeatures(plan: CorpPlan, settings: SiteSettings): PlanFeature[] {
  const perks = corpPerks(plan, settings);
  return [
    { strong: "Temel'deki her şey", text: "ve üstüne:" },
    ...(perks.orderPercent > 0
      ? [{ strong: `Siparişlerde ${pct(perks.orderPercent)} indirim`, text: `(ayda en fazla ${tl(perks.orderMaxTl)})` }]
      : []),
    ...(perks.bonusPercent > 0 ? [{ strong: `Bakiye yüklemelerinde ${pct(perks.bonusPercent)}`, text: "bonus" }] : []),
    { text: plan === "KURUMSAL_PLUS" ? "Size özel müşteri temsilcisi" : "Öncelikli destek" },
  ];
}

/** The three corporate plan cards for /panel/kurumsal/paketler, fitted to the company's current plan. */
export async function buildCorpPlanCards(userId: string) {
  const state = await corporatePlanState(userId);
  const { settings, tier } = state;
  const prices = (plan: CorpPlan) => ({
    aylik: corpPlanPrice(plan, "aylik", settings),
    yillik: corpPlanPrice(plan, "yillik", settings),
  });
  const buy = (plan: CorpPlan) => `/panel/kurumsal/paketler/odeme?paket=${CORP_PLAN_SLUG[plan]}&donem={donem}`;

  const plans: PlanCardData[] = [
    {
      key: "TEMEL",
      name: "Temel",
      tagline: "Şirketin için tek hesaptan alım.",
      prices: null,
      note: "Ek ücret yok; kurumsal hesabınla hemen kullanabilirsin.",
      badge: tier === null ? "Mevcut Paketin" : undefined,
      cta: { label: tier === null ? "Mevcut Paketin" : "Ücretsiz Paket" },
      features: [
        { text: "Şirket unvanına fatura" },
        { text: "Toplu bakiye yükleme ve bakiyeyle ödeme" },
        { text: "Aylık harcama raporu" },
      ],
    },
    {
      key: "KURUMSAL",
      name: "Kurumsal",
      tagline: "Düzenli alım yapan ekipler için.",
      prices: prices("KURUMSAL"),
      highlight: true,
      badge: tier === "KURUMSAL" ? "Mevcut Paketin" : "En Popüler",
      cta: { label: tier === "KURUMSAL" ? "Süreni Uzat" : "Kurumsal'a Geç", href: buy("KURUMSAL") },
      features: planFeatures("KURUMSAL", settings),
    },
    {
      key: "KURUMSAL_PLUS",
      name: "Kurumsal Plus",
      tagline: "Yüksek hacimli alımlar için.",
      prices: prices("KURUMSAL_PLUS"),
      badge: tier === "KURUMSAL_PLUS" ? "Mevcut Paketin" : undefined,
      cta: { label: tier === "KURUMSAL_PLUS" ? "Süreni Uzat" : "Kurumsal Plus'a Geç", href: buy("KURUMSAL_PLUS") },
      features: planFeatures("KURUMSAL_PLUS", settings),
    },
  ];
  return { plans, state };
}
