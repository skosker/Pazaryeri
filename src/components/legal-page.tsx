import Link from "next/link";

/**
 * Shared frame for the pages the bottom bar links to. The text of each page lives in the
 * page file itself, which is where it gets written; this only carries the heading, the
 * breadcrumb and the reading width.
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">{title}</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h1>
      {updatedAt && <p className="mt-2 text-xs text-slate-400">Son güncelleme: {updatedAt}</p>}

      {children ? (
        // Başlık, paragraf ve liste biçimleri burada tanımlı, böylece sayfalar yalnızca
        // metni yazıyor: <h2>, <p>, <ul><li>.
        <div
          className="mt-8 space-y-4 text-[15px] leading-relaxed text-slate-600
            [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-brand-navy
            [&_h2:first-child]:mt-0
            [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-purple-400
            [&_strong]:font-semibold [&_strong]:text-brand-navy"
        >
          {children}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Bu sayfanın metni hazırlanıyor.
        </p>
      )}
    </div>
  );
}
