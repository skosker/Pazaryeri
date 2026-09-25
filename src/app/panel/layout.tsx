import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { unreadConversationCount } from "@/lib/messaging";
import { PanelNav } from "./panel-nav";
import { getSettings } from "@/lib/settings";
import { getOpenCampaigns } from "@/lib/campaign";
import { hasPaidPeriod, membershipSelect, membershipTier, untilFormat } from "@/lib/membership";
import { ProBadge } from "@/components/pro-badge";
import Link from "next/link";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // activeUser rather than the session: it reads the row, so a suspended account or one
  // whose role has changed is turned away here instead of being shown a panel that its
  // actions would then refuse.
  const account = await activeUser();
  if (!account) redirect("/giris?callbackUrl=/panel");

  const isFreelancer = account.role === "FREELANCER";
  const isBuyer = account.role === "BUYER";

  const [user, unreadMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: account.id },
      select: { ...membershipSelect, companyName: true },
    }),
    unreadConversationCount(account.id),
  ]);
  const [{ corporateEnabled, jobRequestsEnabled }, openCampaigns] = await Promise.all([getSettings(), getOpenCampaigns()]);
  const now = new Date();
  const tier = user ? membershipTier(user, now) : null;
  // A paid (or trial) period ending within a week: nudge them to renew before it lapses.
  const endingSoon =
    isFreelancer && user && hasPaidPeriod(user, now) && user.proUntil!.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
      ? user.proUntil!
      : null;

  const navItems = [
    { href: "/panel", label: "Genel Bakış" },
    ...(isFreelancer ? [{ href: "/panel/ilanlarim", label: "İlanlarım" }] : []),
    { href: "/panel/siparisler", label: isFreelancer ? "Siparişler" : "Siparişlerim" },
    { href: "/panel/mesajlar", label: "Mesajlar", badge: unreadMessages },
    ...(jobRequestsEnabled ? [{ href: "/panel/is-taleplerim", label: "İş Taleplerim" }] : []),
    ...(jobRequestsEnabled && isFreelancer ? [{ href: "/panel/tekliflerim", label: "Tekliflerim" }] : []),
    ...(isFreelancer && openCampaigns.length > 0 ? [{ href: "/panel/kampanyalar", label: "Kampanyalar" }] : []),
    ...(isFreelancer ? [{ href: "/panel/odeme-bilgileri", label: "Ödeme Bilgileri" }] : []),
    ...(corporateEnabled && user?.companyName ? [{ href: "/panel/kurumsal", label: "Kurumsal Hesap" }] : []),
    { href: "/panel/davet", label: "Davet Et" },
    { href: "/panel/profil", label: "Profilim" },
    { href: "/panel/sifre", label: "Şifre Değiştir" },
    // Membership is sold to freelancers only; members come back here to renew or upgrade.
    ...(isFreelancer ? [{ href: "/panel/pro-ol", label: tier ? "Üyeliğim" : "Pro Üyelik" }] : []),
    ...(isBuyer ? [{ href: "/panel/freelancer-ol", label: "Freelancer Ol" }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {isFreelancer ? "Freelancer Paneli" : "Alıcı Paneli"}
            </p>
            {(isBuyer || isFreelancer) && tier && <ProBadge plus={tier === "PRO_PLUS"} />}
          </div>
          <p className="mb-4 mt-1 text-xs text-slate-400">
            {isFreelancer
              ? "Alıcı olarak da sipariş verebilirsin — Siparişler > Verdiğim Siparişler."
              : "Siparişlerini ve profilini buradan yönetirsin."}
          </p>
          <PanelNav items={navItems} />
        </aside>

        <div className="min-w-0 flex-1">
          {endingSoon && (
            <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {tier === "PRO_PLUS" ? "Pro Plus" : "Pro"} üyeliğin {untilFormat.format(endingSoon)} tarihinde bitiyor.{" "}
              <Link href="/panel/pro-ol" className="font-semibold underline">
                Üyeliğini Yenile
              </Link>
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
