import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { budgetLabel, listOpenRequests, shortName, timeAgo } from "@/lib/job-requests";

export const metadata: Metadata = {
  title: "İş Talepleri",
  description: "Alıcıların açtığı iş talepleri: bütçesini ve süresini gör, ilanınla teklif ver.",
};

function toSingle(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function JobRequestsPage(props: PageProps<"/is-talepleri">) {
  const [settings, session] = await Promise.all([getSettings(), auth()]);
  if (!settings.jobRequestsEnabled && session?.user?.role !== "ADMIN") notFound();

  const sp = await props.searchParams;
  const category = toSingle(sp.kategori);
  const q = toSingle(sp.q).trim();
  const page = Number(toSingle(sp.sayfa)) || 1;
  const [categories, { rows, total, pageCount }] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    listOpenRequests({ categorySlug: category || undefined, q: q || undefined, page }),
  ]);
  const href = (next: { kategori?: string; sayfa?: number }) => {
    const p = new URLSearchParams();
    const k = next.kategori ?? category;
    if (k) p.set("kategori", k);
    if (q) p.set("q", q);
    if (next.sayfa && next.sayfa > 1) p.set("sayfa", String(next.sayfa));
    const s = p.toString();
    return s ? `/is-talepleri?${s}` : "/is-talepleri";
  };
  const canPost = session?.user && session.user.role !== "ADMIN";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">İş Talepleri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Alıcıların aradığı işler. Bütçeyi ve süreyi gör, ilanlarından biriyle teklif ver.
          </p>
        </div>
        <Link
          href={canPost ? "/panel/is-taleplerim/yeni" : "/giris?callbackUrl=/panel/is-taleplerim/yeni"}
          className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          İş Talebi Aç
        </Link>
      </div>

      <form method="get" className="mt-6 flex gap-2">
        {category && <input type="hidden" name="kategori" value={category} />}
        <input
          name="q"
          defaultValue={q}
          aria-label="Taleplerde ara"
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-purple-400"
        />
        <button className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700">Ara</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {[{ slug: "", name: "Tümü" }, ...categories].map((c) => (
          <Link
            key={c.slug || "tumu"}
            href={href({ kategori: c.slug })}
            className={`rounded-full px-3 py-1.5 font-semibold ${
              category === c.slug ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-500">{total} açık talep</p>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400">
          Bu filtrelere uyan açık talep yok.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/is-talepleri/${r.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                    {r.category.name}
                  </span>
                  <h2 className="mt-2 font-semibold text-brand-navy">{r.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-navy">{budgetLabel(r.budgetMin, r.budgetMax)}</p>
                  <p className="text-xs text-slate-500">{r.deliveryDays} günde teslim</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {shortName(r.buyer.name)} · {timeAgo(r.createdAt)} · {r._count.offers} teklif
              </p>
            </Link>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href({ sayfa: page - 1 })} className="rounded-full border border-slate-300 px-4 py-1.5">Önceki</Link>}
          <span className="text-slate-500">Sayfa {page} / {pageCount}</span>
          {page < pageCount && <Link href={href({ sayfa: page + 1 })} className="rounded-full border border-slate-300 px-4 py-1.5">Sonraki</Link>}
        </div>
      )}
    </div>
  );
}
