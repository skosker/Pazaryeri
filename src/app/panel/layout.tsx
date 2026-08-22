import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";
import { PanelNav } from "./panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // activeUser rather than the session: it reads the row, so a suspended account or one
  // whose role has changed is turned away here instead of being shown a panel that its
  // actions would then refuse.
  const account = await activeUser();
  if (!account) redirect("/giris?callbackUrl=/panel");

  const isFreelancer = account.role === "FREELANCER";
  const isBuyer = account.role === "BUYER";

  const user = await prisma.user.findUnique({
    where: { id: account.id },
    select: { isPro: true },
  });
  const isPro = user?.isPro ?? false;

  const navItems = [
    { href: "/panel", label: "Genel Bakış" },
    ...(isFreelancer ? [{ href: "/panel/ilanlarim", label: "İlanlarım" }] : []),
    { href: "/panel/siparisler", label: isFreelancer ? "Siparişler" : "Siparişlerim" },
    ...(isFreelancer ? [{ href: "/panel/odeme-bilgileri", label: "Ödeme Bilgileri" }] : []),
    { href: "/panel/profil", label: "Profilim" },
    { href: "/panel/sifre", label: "Şifre Değiştir" },
    ...(isBuyer && !isPro ? [{ href: "/panel/pro-ol", label: "Prosinta Pro Ol" }] : []),
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
            {isBuyer && isPro && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                Pro
              </span>
            )}
          </div>
          <p className="mb-4 mt-1 text-xs text-slate-400">
            {isFreelancer
              ? "Alıcı olarak da sipariş verebilirsin — Siparişler > Verdiğim Siparişler."
              : "Siparişlerini ve profilini buradan yönetirsin."}
          </p>
          <PanelNav items={navItems} />
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
