import Link from "next/link";
import { LegalNav } from "@/components/legal-nav";
import { legalProseClass } from "@/components/legal-prose";

/**
 * Shared frame for the pages the bottom bar links to. The text of each page lives in the
 * page file itself, which is where it gets written; this carries the heading, the
 * breadcrumb, the side menu and the reading width.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  /** Shown as "Son güncelleme"; leave out while the text is still being written. */
  updatedAt?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">{title}</span>
      </nav>

      {/* The menu sits after the text on a phone, where a column of links above the
          document would push it off the screen. */}
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[240px_1fr] lg:items-start">
        <aside className="order-2 lg:sticky lg:top-20 lg:order-1">
          <LegalNav />
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h1>
          {updatedAt && (
            <p className="mt-2 text-xs text-slate-400">Son güncelleme: {updatedAt}</p>
          )}

          {children ? (
            // Başlık, paragraf ve liste biçimleri burada tanımlı, böylece sayfalar
            // yalnızca metni yazıyor: <h2>, <p>, <ul><li>.
            <div className={`mt-8 ${legalProseClass}`}>
              {children}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
              Bu sayfanın metni hazırlanıyor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
