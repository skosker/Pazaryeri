import Link from "next/link";
import { listFreelancers, getFreelancerFacets } from "@/lib/freelancers";
import { UserAvatar } from "@/components/user-avatar";
import { StarRating } from "@/components/star-rating";
import { FilterBar } from "./filter-bar";

const PAGE_SIZE = 24;

function toSingle(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params: { q: string; city: string; title: string; onlineOnly: boolean; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.city) search.set("sehir", params.city);
  if (params.title) search.set("meslek", params.title);
  if (params.onlineOnly) search.set("cevrimici", "1");
  if (params.page && params.page > 1) search.set("sayfa", String(params.page));
  const qs = search.toString();
  return qs ? `/freelancerlar?${qs}` : "/freelancerlar";
}

/** A window of page numbers around the current one — 42 pages will not fit in a row. */
function pageWindow(page: number, pageCount: number) {
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, Math.max(page + 2, 5));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default async function FreelancerlarPage(props: PageProps<"/freelancerlar">) {
  const searchParams = await props.searchParams;

  const q = toSingle(searchParams.q);
  const city = toSingle(searchParams.sehir);
  const title = toSingle(searchParams.meslek);
  const onlineOnly = toSingle(searchParams.cevrimici) === "1";
  const page = Number(toSingle(searchParams.sayfa) || "1") || 1;

  const [{ cards, total, pageCount }, facets] = await Promise.all([
    listFreelancers({ q, city, title, onlineOnly, page, pageSize: PAGE_SIZE }),
    getFreelancerFacets(),
  ]);

  const hrefBase = { q, city, title, onlineOnly };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">Freelancerlar</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">Freelancer Bul</h1>
      <p className="mt-1 text-sm text-slate-500">
        {total} freelancer · mesleğe, şehre ve uzmanlığa göre filtrele.
      </p>

      <div className="mt-6">
        <FilterBar cities={facets.cities} titles={facets.titles} selected={{ q, city, title, onlineOnly }} />
      </div>

      {cards.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400">
          Bu filtrelere uyan freelancer bulunamadı.
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((freelancer) => (
              <Link
                key={freelancer.id}
                href={`/freelancer/${freelancer.id}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/70"
              >
                <div className="flex items-start gap-3">
                  <span className="relative block h-14 w-14 shrink-0">
                    <UserAvatar
                      name={freelancer.name}
                      image={freelancer.image}
                      className="h-14 w-14 text-lg"
                    />
                    {freelancer.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-brand-navy group-hover:text-purple-700">
                        {freelancer.name}
                      </p>
                      {freelancer.isPro && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{freelancer.title ?? "Freelancer"}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[freelancer.city, freelancer.age ? `${freelancer.age} yaş` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                {freelancer.skills.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {freelancer.skills.slice(0, 4).map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  {freelancer.rating !== null ? (
                    <StarRating rating={freelancer.rating} count={freelancer.reviewCount} />
                  ) : (
                    <span>Henüz değerlendirme yok</span>
                  )}
                  <span className="shrink-0">{freelancer.gigCount} ilan</span>
                </div>
              </Link>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={buildHref({ ...hrefBase, page: page - 1 })}
                aria-disabled={page <= 1}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  page <= 1
                    ? "pointer-events-none border-slate-100 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Önceki
              </Link>
              {pageWindow(page, pageCount).map((n) => (
                <Link
                  key={n}
                  href={buildHref({ ...hrefBase, page: n })}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    n === page ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </Link>
              ))}
              <span className="text-xs text-slate-400">/ {pageCount}</span>
              <Link
                href={buildHref({ ...hrefBase, page: page + 1 })}
                aria-disabled={page >= pageCount}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  page >= pageCount
                    ? "pointer-events-none border-slate-100 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Sonraki
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
