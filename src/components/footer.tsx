import Link from "next/link";
import { Logo } from "@/components/logo";
import { companyLinks, policyLinks } from "@/components/legal-bar";

export type FooterCategory = { label: string; slug: string };

type FooterLink = { href: string; label: string };

const marketplaceLinks: FooterLink[] = [
  { href: "/kategoriler", label: "Hizmetler" },
  { href: "/freelancerlar", label: "Freelancer Bul" },
  { href: "/kayit?role=FREELANCER", label: "Freelancer Ol" },
  { href: "/uyelik", label: "Üyelik Paketleri" },
];

/**
 * The one footer on every page: brand, categories, marketplace, company and policy links,
 * then the company line. It replaces what used to be a white footer plus a separate dark
 * legal bar, which repeated the brand blurb one above the other.
 */
export function Footer({ categories }: { categories: FooterCategory[] }) {
  return (
    <footer className="bg-brand-navy text-sm text-slate-300">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo textClassName="text-white" />
            <p className="mt-4 max-w-xs text-slate-400">
              İhtiyacın neyse, yeteneği burada. Freelancer&apos;lar ile işini yaptırmak isteyenleri
              buluşturan pazaryeri; ödemen, işi onaylayana kadar Prosinta güvencesinde bekler.
            </p>
          </div>

          {categories.length > 0 && (
            <LinkColumn
              title="Kategoriler"
              links={categories.map((c) => ({ href: `/kategoriler?kategori=${c.slug}`, label: c.label }))}
            />
          )}
          <LinkColumn title="Prosinta" links={marketplaceLinks} />
          <LinkColumn title="Kurumsal" links={companyLinks} />
          <LinkColumn title="Sözleşmeler" links={policyLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Prosinta Dijital Teknolojiler A.Ş. © {new Date().getFullYear()} · Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:destek@prosinta.com" className="transition hover:text-purple-300">
              destek@prosinta.com
            </a>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG trust
                badge, not a photo; next/image's optimizer offers nothing for a vector file. */}
            <img
              src="/odeme-logolari.svg"
              alt="Mastercard, Visa"
              className="h-7 w-auto rounded-md bg-white px-2 py-1"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-4 space-y-2.5">
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
