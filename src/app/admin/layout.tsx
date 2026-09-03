import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

/** Grouped by purpose so related pages sit together in the sidebar; `label: null` is
 * the lone Genel Bakış link, shown with no group heading above it. */
const navGroups: { label: string | null; items: { href: string; label: string }[] }[] = [
  { label: null, items: [{ href: "/admin", label: "Genel Bakış" }] },
  {
    label: "Finans",
    items: [
      { href: "/admin/havale-onaylari", label: "Havale/EFT Onayları" },
      { href: "/admin/hakedisler", label: "Hakedişler" },
      { href: "/admin/hakedis-odemeleri", label: "Hakediş Ödemeleri" },
      { href: "/admin/freelancer-ibanlari", label: "Freelancer IBAN’ları" },
      { href: "/admin/banka", label: "Şirket Banka Hesapları" },
    ],
  },
  {
    label: "Pazaryeri",
    items: [
      { href: "/admin/siparisler", label: "Siparişler" },
      { href: "/admin/kullanicilar", label: "Kullanıcılar" },
      { href: "/admin/ilanlar", label: "İlanlar" },
      { href: "/admin/kategoriler", label: "Kategoriler" },
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin Paneli
          </p>
          {/* Telefonda bağlantılar yatay kayan bir şerit. Etiketlerin tek satırda
              kalması şart: whitespace-nowrap olmadan uzun olanlar ("Havale/EFT
              Onayları") ikiye bölünüyor ve satırlar birbirine giriyor. Negatif kenar
              boşluğu şeridi ekran kenarına kadar uzatıyor, böylece kırpılmış değil
              kaydırılabilir olduğu anlaşılıyor. Grup başlıkları yalnızca geniş ekranda
              görünüyor; şeritte yer kaplamalarının anlamı yok. */}
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {navGroups.map((group) => (
              <div key={group.label ?? "genel-bakis"} className="flex gap-2 lg:flex-col lg:gap-1">
                {group.label && (
                  <p className="hidden px-3 text-[11px] font-bold uppercase tracking-wide text-slate-700 lg:block">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-navy lg:border-0"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
