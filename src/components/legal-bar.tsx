import Link from "next/link";

/**
 * The slim dark bar at the very bottom of every page — company details and the pages a
 * marketplace is expected to publish. It lives in the root layout rather than in
 * `Footer`, because the footer is hidden on the home page and on the auth screens while
 * these links have to be reachable from everywhere.
 */

/** Yan menü bu listenin tamamını gösterir; alt bar aşağıda bir kısmını eler. */
export const legalLinks = [
  { href: "/hakkimizda", label: "Prosinta Hakkında" },
  { href: "/uyelik-sozlesmesi", label: "Üyelik Sözleşmesi" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/gizlilik-politikasi", label: "Kişisel Verilerin Korunması Politikası" },
  { href: "/cerez-tercihleri", label: "Çerez Tercihleri" },
];

export function LegalBar() {
  return (
    <div className="bg-brand-navy">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Çerez tercihleri alt barda yer almıyor: sayfa duruyor ve KVKK metninden
              erişilebiliyor, ama her sayfanın altında sıralanacak kadar öne çıkmıyor. */}
          {legalLinks
            .filter((link) => link.href !== "/cerez-tercihleri")
            .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-purple-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="shrink-0 text-sm text-slate-400">
          Prosinta Dijital Teknolojiler A.Ş. © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
