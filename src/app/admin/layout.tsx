import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

const navItems = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/havale-onaylari", label: "Havale/EFT Onayları" },
  { href: "/admin/hakedisler", label: "Hakedişler" },
  { href: "/admin/siparisler", label: "Siparişler" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar" },
  { href: "/admin/ilanlar", label: "İlanlar" },
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/kapaklar", label: "İlan Kapakları" },
  { href: "/admin/profil-fotograflari", label: "Profil Fotoğrafları" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin Paneli
          </p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
