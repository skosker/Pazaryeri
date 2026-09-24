import Link from "next/link";

/**
 * The dark band at the very bottom of every page — company details and the pages a
 * marketplace is expected to publish. It lives in the root layout rather than in
 * `Footer`, because the footer is hidden on the home page and on the auth screens while
 * these links have to be reachable from everywhere. Deliberately roomy: on those short
 * pages it is what closes the screen.
 */

const companyLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/destek", label: "Destek" },
];

const policyLinks = [
  { href: "/uyelik-sozlesmesi", label: "Üyelik Sözleşmesi" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/iptal-iade-kosullari", label: "Sipariş İptal ve İade Koşulları" },
  { href: "/gizlilik-politikasi", label: "Kişisel Verilerin Korunması Politikası" },
];

/** The pages the legal-page side menu lists (no "Nasıl Çalışır?", which is not one of them). */
export const legalLinks = [...companyLinks.filter((l) => l.href !== "/nasil-calisir"), ...policyLinks];

export function LegalBar() {
  return (
    <div className="bg-brand-navy text-sm text-slate-300">
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold text-white">Prosinta</p>
            <p className="mt-3 max-w-sm text-slate-400">
              Freelancer&apos;lar ile işini yaptırmak isteyenleri buluşturan pazaryeri. Ödemen, işi
              onaylayana kadar Prosinta güvencesinde bekler.
            </p>
          </div>
          <LinkColumn title="Kurumsal" links={companyLinks} />
          <LinkColumn title="Sözleşmeler ve Politikalar" links={policyLinks} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Prosinta Dijital Teknolojiler A.Ş. © {new Date().getFullYear()} · Tüm hakları saklıdır.</p>
          <a href="mailto:destek@prosinta.com" className="transition hover:text-purple-300">
            destek@prosinta.com
          </a>
        </div>
      </div>
    </div>
  );
}

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-purple-300">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
