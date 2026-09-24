import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { campaignPrice, livePerkPercents } from "@/lib/campaign";
import {
  PERIOD_MONTHS,
  PLAN_SLUG,
  membershipSelect,
  membershipTier,
  planListPrice,
  portfolioLimitFor,
  trialEligible,
  type Period,
  type Plan,
} from "@/lib/membership";
import type { PlanCardData, PlanPeriodPrice } from "@/components/membership-plans";

type Viewer = { id: string; role: string } | null;

const round2 = (n: number) => Math.round(n * 100) / 100;

function trialLabel(days: number): string {
  return days === 30 ? "1 Ay Ücretsiz Dene" : `${days} Gün Ücretsiz Dene`;
}

/**
 * The plan cards for /uyelik and /panel/pro-ol, with prices and features read from
 * /admin/ayarlar and the buttons fitted to who is looking: a visitor is sent to sign up,
 * a buyer is told it is for freelancers, a freelancer gets to buy, renew or upgrade.
 */
export async function buildPlanCards(
  viewer: Viewer,
  /** What the trial button does for an eligible freelancer: a form action, or a link. */
  trialTarget?: (() => Promise<void>) | string
) {
  const [settings, perks] = await Promise.all([getSettings(), livePerkPercents()]);
  const member =
    viewer?.role === "FREELANCER"
      ? await prisma.user.findUnique({ where: { id: viewer.id }, select: { ...membershipSelect, proTrialUsedAt: true } })
      : null;
  const tier = member ? membershipTier(member) : null;

  const price = (plan: Plan, period: Period): PlanPeriodPrice => {
    const list = planListPrice(plan, period, settings);
    const total = campaignPrice(list.total, perks.pro || null);
    return {
      total,
      perMonth: round2(total / PERIOD_MONTHS[period]),
      listPerMonth: planListPrice(plan, "aylik", settings).total,
    };
  };
  const prices = (plan: Plan) => ({ aylik: price(plan, "aylik"), yillik: price(plan, "yillik") });

  const buyHref = (plan: Plan) => `/panel/pro-ol/odeme?paket=${PLAN_SLUG[plan]}&donem={donem}`;
  const signUp = "/kayit?role=FREELANCER";

  const cta = (plan: Plan | "FREE"): PlanCardData["cta"] => {
    if (!viewer) return plan === "FREE" ? { label: "Ücretsiz Kaydol", href: signUp } : { label: "Hemen Başla", href: signUp };
    if (viewer.role !== "FREELANCER") {
      return plan === "FREE" ? { label: "Freelancer Ol", href: "/panel/freelancer-ol" } : { label: "Freelancer'lara Özel" };
    }
    if (plan === "FREE") return { label: tier === null ? "Mevcut Paketin" : "Ücretsiz Paket" };
    if (plan === "PRO") {
      if (member?.isPro) return { label: "Süresiz Pro Üyesisin" };
      return { label: tier === "PRO" ? "Süreni Uzat" : "Pro'ya Geç", href: buyHref("PRO") };
    }
    return { label: tier === "PRO_PLUS" ? "Süreni Uzat" : "Pro Plus'a Geç", href: buyHref("PRO_PLUS") };
  };

  let trial: PlanCardData["trial"];
  if (settings.proTrialEnabled && settings.proTrialDays > 0) {
    if (!viewer) trial = { label: trialLabel(settings.proTrialDays), href: signUp };
    else if (member && trialTarget && trialEligible(member, settings)) {
      const label = trialLabel(settings.proTrialDays);
      trial = typeof trialTarget === "string" ? { label, href: trialTarget } : { label, action: trialTarget };
    }
  }

  const plans: PlanCardData[] = [
    {
      key: "FREE",
      name: "Ücretsiz",
      tagline: "Başlamak için ihtiyacın olan her şey.",
      prices: null,
      badge: viewer?.role === "FREELANCER" && tier === null ? "Mevcut Paketin" : undefined,
      cta: cta("FREE"),
      features: [
        { strong: "Sınırsız", text: "ilan yayınlama" },
        { strong: `${settings.portfolioImages}`, text: "örnek iş görseli (ilan başına)" },
        { text: "Alıcılarla güvenli mesajlaşma" },
        { text: "Prosinta güvenceli ödeme" },
      ],
    },
    {
      key: "PRO",
      name: "Pro",
      tagline: "Daha çok görün, daha çok iş al.",
      prices: prices("PRO"),
      highlight: true,
      badge: tier === "PRO" ? "Mevcut Paketin" : "En Popüler",
      cta: cta("PRO"),
      trial,
      features: [
        { strong: "Pro rozeti", text: "ilanlarında ve profilinde" },
        { strong: "Aramalarda öncelik:", text: "Pro olmayanların önünde" },
        { text: "Alıcıların “Sadece Pro” filtresinde görünme" },
        { strong: `${portfolioLimitFor("PRO", settings)}`, text: "örnek iş görseli (ilan başına)" },
        ...(settings.proFreeBoostDays > 0
          ? [{ strong: `Her ay ${settings.proFreeBoostDays} gün`, text: "ücretsiz Öne Çıkar" }]
          : []),
        { text: "Profilinde Beğeni ve Yorumlar bölümü" },
      ],
    },
    {
      key: "PRO_PLUS",
      name: "Pro Plus",
      tagline: "En üstte ol, en çok sen görün.",
      prices: prices("PRO_PLUS"),
      badge: tier === "PRO_PLUS" ? "Mevcut Paketin" : undefined,
      cta: cta("PRO_PLUS"),
      features: [
        { strong: "Pro'daki her şey", text: "ve üstüne:" },
        { strong: "Pro Plus rozeti", text: "ilanlarında ve profilinde" },
        { strong: "Aramalarda öncelik:", text: "Pro üyelerin de önünde" },
        { strong: "Freelancer Bul", text: "listesinde en üstte" },
        { strong: `${portfolioLimitFor("PRO_PLUS", settings)}`, text: "örnek iş görseli (ilan başına)" },
        ...(settings.plusFreeBoostDays > 0
          ? [{ strong: `Her ay ${settings.plusFreeBoostDays} gün`, text: "ücretsiz Öne Çıkar" }]
          : []),
        ...(settings.plusBoostDiscountPercent > 0
          ? [{ strong: `%${settings.plusBoostDiscountPercent.toLocaleString("tr-TR")} indirimli`, text: "Öne Çıkar" }]
          : []),
      ],
    },
  ];

  return {
    plans,
    yearlyDiscountPercent: settings.yearlyDiscountPercent,
    campaignNote: perks.pro > 0 ? `${perks.name} kampanyası: üyeliklerde %${perks.pro} indirim fiyatlara yansıtıldı` : null,
    member,
    tier,
    settings,
  };
}
