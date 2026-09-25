import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminNav, type NavGroup } from "./admin-nav";

/** Grouped by purpose so related pages sit together in the sidebar; `label: null` is
 * the lone Genel Bakış link, shown with no group heading above it. */
const navGroups: NavGroup[] = [
  { label: null, items: [{ href: "/admin", label: "Genel Bakış" }] },
  {
    label: "Finans",
    items: [
      { href: "/admin/havale-onaylari", label: "Havale/EFT Onayları" },
      { href: "/admin/hakedisler", label: "Hakedişler" },
      { href: "/admin/hakedis-odemeleri", label: "Hakediş Ödemeleri" },
      { href: "/admin/gelir", label: "Gelir Raporu" },
      { href: "/admin/faturalar", label: "Faturalar" },
      { href: "/admin/freelancer-ibanlari", label: "Freelancer IBAN’ları" },
      { href: "/admin/banka", label: "Şirket Banka Hesapları" },
      { href: "/admin/kurumsal", label: "Kurumsal Hesaplar" },
    ],
  },
  {
    label: "Pazaryeri",
    items: [
      { href: "/admin/siparisler", label: "Siparişler" },
      { href: "/admin/kullanicilar", label: "Kullanıcılar" },
      { href: "/admin/ilanlar", label: "İlanlar" },
      { href: "/admin/is-talepleri", label: "İş Talepleri" },
      { href: "/admin/kategoriler", label: "Kategoriler" },
      { href: "/admin/ayarlar", label: "Üyelik ve Gelir Ayarları" },
      { href: "/admin/kampanyalar", label: "Kampanyalar" },
    ],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/kapaklar", label: "İlan Kapakları" },
      { href: "/admin/profil-fotograflari", label: "Profil Fotoğrafları" },
      // Geçici olarak menüden gizli — rota ve işlevsellik dokunulmadan duruyor, sadece
      // görünürlük kapalı. Tekrar görünür yapılması istenirse bu satırı geri ekle:
      // { href: "/admin/ai-portreler", label: "AI Portreler" },
    ],
  },
];

/** Each group's pages in the order saved by dragging; pages added since go at the end. */
function applySavedOrder(groups: NavGroup[], saved: unknown): NavGroup[] {
  const order = (saved && typeof saved === "object" ? saved : {}) as Record<string, string[]>;
  return groups.map((g) => {
    const hrefs = g.label ? order[g.label] : undefined;
    if (!Array.isArray(hrefs)) return g;
    const rank = (href: string) => {
      const i = hrefs.indexOf(href);
      return i < 0 ? hrefs.length : i;
    };
    return { ...g, items: [...g.items].sort((a, b) => rank(a.href) - rank(b.href)) };
  });
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const saved = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { adminNavOrder: true } });
  const groups = applySavedOrder(navGroups, saved?.adminNavOrder);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin Paneli
          </p>
          <AdminNav groups={groups} />
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
