"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const categoryLinks = [
  { label: "Grafik Tasarım", slug: "grafik-tasarim" },
  { label: "Yazılım & Web", slug: "yazilim-web" },
  { label: "Dijital Pazarlama", slug: "dijital-pazarlama" },
  { label: "Yazı & Çeviri", slug: "yazi-ceviri" },
];

// Pages that carry their own closing section, or that should stay focused on a single
// task, do not get the footer.
const hiddenOn = ["/", "/giris", "/kayit"];

export function Footer() {
  const pathname = usePathname();
  if (pathname && hiddenOn.includes(pathname)) return null;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, dakikalar
              içinde işine başla.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-navy">Kategoriler</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              {categoryLinks.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategoriler?kategori=${c.slug}`} className="hover:text-brand-navy">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-navy">Prosinta</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>
                <Link href="/kayit?role=FREELANCER" className="hover:text-brand-navy">
                  Freelancer Ol
                </Link>
              </li>
              <li>
                <Link href="/kategoriler" className="hover:text-brand-navy">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/freelancerlar" className="hover:text-brand-navy">
                  Freelancer Bul
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Prosinta. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
