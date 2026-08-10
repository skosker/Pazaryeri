import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PanelNav } from "./panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel");

  const isFreelancer = session.user.role === "FREELANCER";
  const isBuyer = session.user.role === "BUYER";

  const navItems = [
    { href: "/panel", label: "Genel Bakış" },
    ...(isFreelancer ? [{ href: "/panel/ilanlarim", label: "İlanlarım" }] : []),
    { href: "/panel/siparisler", label: isFreelancer ? "Siparişler" : "Siparişlerim" },
    { href: "/panel/profil", label: "Profilim" },
    ...(isBuyer ? [{ href: "/panel/freelancer-ol", label: "Freelancer Ol" }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {isFreelancer ? "Freelancer Paneli" : "Alıcı Paneli"}
          </p>
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
