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
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-600">{children}</div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          Bu sayfanın metni hazırlanıyor.
        </p>
      )}
    </div>
  );
}
