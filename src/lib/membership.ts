import type { Prisma } from "@/generated/prisma/client";
import type { SiteSettings } from "@/lib/settings";

/**
 * Freelancer membership: Pro and Pro Plus, paid monthly or yearly (prices at
 * /admin/ayarlar). Membership is worked out from three columns rather than stored as
 * one flag, so it lapses on its own when the paid period ends:
 *   - isPro: süresiz Pro (bought once before monthly/yearly plans, or granted by admin)
 *   - proUntil / proPlus: the paid (or trial) period and whether it is Pro Plus
 */

export type Plan = "PRO" | "PRO_PLUS";
export type Tier = Plan | null;
export type Period = "aylik" | "yillik";

export const PLAN_LABEL: Record<Plan, string> = { PRO: "Pro", PRO_PLUS: "Pro Plus" };
export const PERIOD_MONTHS: Record<Period, number> = { aylik: 1, yillik: 12 };
export const PERIOD_LABEL: Record<Period, string> = { aylik: "Aylık", yillik: "Yıllık" };

/** URL spelling of a plan (?paket=pro-plus). */
export const PLAN_SLUG: Record<Plan, string> = { PRO: "pro", PRO_PLUS: "pro-plus" };

export function parsePlan(value: unknown): Plan | null {
  if (value === "pro") return "PRO";
  if (value === "pro-plus") return "PRO_PLUS";
  return null;
}

export function parsePeriod(value: unknown): Period | null {
  return value === "aylik" || value === "yillik" ? value : null;
}

export function periodOfMonths(months: number | null): Period | null {
  if (months === 1) return "aylik";
  if (months === 12) return "yillik";
  return null;
}

/** The columns every membership check needs; spread into a Prisma `select`. */
export const membershipSelect = { isPro: true, proUntil: true, proPlus: true } satisfies Prisma.UserSelect;

export type MembershipFields = { isPro: boolean; proUntil: Date | null; proPlus: boolean };

export function hasPaidPeriod(user: MembershipFields, now = new Date()): boolean {
  return user.proUntil !== null && user.proUntil > now;
}

export function membershipTier(user: MembershipFields, now = new Date()): Tier {
  const paid = hasPaidPeriod(user, now);
  if (paid && user.proPlus) return "PRO_PLUS";
  if (paid || user.isPro) return "PRO";
  return null;
}

/** Prisma filter: a Pro member of any tier right now. */
export function proMemberWhere(now = new Date()): Prisma.UserWhereInput {
  return { OR: [{ isPro: true }, { proUntil: { gt: now } }] };
}

/** Prisma filter: a Pro Plus member right now. */
export function plusMemberWhere(now = new Date()): Prisma.UserWhereInput {
  return { proPlus: true, proUntil: { gt: now } };
}

export function monthlyPrice(plan: Plan, settings: SiteSettings): number {
  return plan === "PRO_PLUS" ? settings.plusMonthlyTl : settings.proMonthlyTl;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * List price of a plan before any campaign: monthly is the monthly price; yearly is
 * twelve months at the yearly discount. `perMonth` is what the plan cards show.
 */
export function planListPrice(plan: Plan, period: Period, settings: SiteSettings): { total: number; perMonth: number } {
  const monthly = monthlyPrice(plan, settings);
  if (period === "aylik") return { total: monthly, perMonth: monthly };
  const perMonth = round2((monthly * (100 - settings.yearlyDiscountPercent)) / 100);
  return { total: round2(perMonth * 12), perMonth };
}

/** `date` plus `months` calendar months, kept on the last day when the month is shorter. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

/**
 * Where a paid purchase leaves the member. The new period starts now; whatever is left of
 * a running period is carried over rather than lost, converted by the two plans' monthly
 * prices — so ten days of Pro Plus left become 12,5 days of Pro, and renewing the
 * same plan simply adds on.
 */
export function extendMembership(
  user: MembershipFields,
  plan: Plan,
  months: number,
  settings: SiteSettings,
  now = new Date()
): { proUntil: Date; proPlus: boolean } {
  let carriedMs = 0;
  if (hasPaidPeriod(user, now)) {
    const remaining = user.proUntil!.getTime() - now.getTime();
    const current = monthlyPrice(user.proPlus ? "PRO_PLUS" : "PRO", settings);
    const next = monthlyPrice(plan, settings);
    carriedMs = current > 0 && next > 0 ? (remaining * current) / next : remaining;
  }
  return {
    proUntil: new Date(addMonths(now, months).getTime() + Math.round(carriedMs)),
    proPlus: plan === "PRO_PLUS",
  };
}

/** Monthly free "Öne Çıkar" days that come with a tier (0: none). */
export function freeBoostDays(tier: Tier, settings: SiteSettings): number {
  if (tier === "PRO_PLUS") return settings.plusFreeBoostDays;
  if (tier === "PRO") return settings.proFreeBoostDays;
  return 0;
}

/** "Örnek iş" images allowed per gig for a tier. */
export function portfolioLimitFor(tier: Tier, settings: SiteSettings): number {
  if (tier === "PRO_PLUS") return Math.max(settings.portfolioImagesPlus, settings.portfolioImagesPro);
  if (tier === "PRO") return settings.portfolioImagesPro;
  return settings.portfolioImages;
}

/** The calendar month in Istanbul ("2026-10") a monthly allowance belongs to. */
export function istanbulMonth(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" }).format(now);
}

/** Can this user start the free Pro trial? Only once, and only if never a member. */
export function trialEligible(
  user: MembershipFields & { proTrialUsedAt: Date | null },
  settings: SiteSettings
): boolean {
  return settings.proTrialEnabled && settings.proTrialDays > 0 && !user.isPro && user.proUntil === null && user.proTrialUsedAt === null;
}

export const untilFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});
