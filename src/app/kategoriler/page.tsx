import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listGigs, getCategoryFreelancerSummary, type GigFilters } from "@/lib/gigs";
import { GigCard } from "@/components/gig-card";
import { CategoryIcon } from "@/components/category-icon";
import { UserAvatar } from "@/components/user-avatar";
import { FilterBar } from "./filter-bar";
import { SortSelect } from "./sort-select";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toSingle(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/** A window of page numbers around the current one — dozens of pages will not fit in a row. */
function pageWindow(page: number, pageCount: number) {
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, Math.max(page + 2, 5));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildHref(base: {
  categorySlugs: string[];
  subcategorySlugs: string[];
  q?: string;
  butce?: string;
  sure?: string;
  sirala?: string;
  cevrimici?: boolean;
  pro?: boolean;
  sayfa?: number;
}) {
  const search = new URLSearchParams();
  base.categorySlugs.forEach((slug) => search.append("kategori", slug));
  base.subcategorySlugs.forEach((slug) => search.append("alt", slug));
  if (base.q) search.set("q", base.q);
  if (base.butce) search.set("butce", base.butce);
  if (base.sure) search.set("sure", base.sure);
  if (base.sirala) search.set("sirala", base.sirala);
  if (base.cevrimici) search.set("cevrimici", "1");
  if (base.pro) search.set("pro", "1");
  if (base.sayfa && base.sayfa > 1) search.set("sayfa", String(base.sayfa));
  const qs = search.toString();
  return qs ? `/kategoriler?${qs}` : "/kategoriler";
}

const PAGE_SIZE = 24;

export default async function KategorilerPage(props: PageProps<"/kategoriler">) {
  const searchParams = await props.searchParams;

  const categorySlugs = toArray(searchParams.kategori);
  const subcategorySlugs = toArray(searchParams.alt);
  const q = toSingle(searchParams.q);
  const butce = toSingle(searchParams.butce);
  const sure = toSingle(searchParams.sure);
  const sirala = toSingle(searchParams.sirala) as GigFilters["sort"];
  const cevrimici = toSingle(searchParams.cevrimici) === "1";
  const proParam = toSingle(searchParams.pro) === "1";
  const sayfa = Number(toSingle(searchParams.sayfa) ?? "1") || 1;

  const session = await auth();
  const isProBuyer =
    session?.user?.role === "BUYER"
      ? Boolean((await prisma.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } }))?.isPro)
      : false;
  const proOnly = isProBuyer && proParam;

  const filters: GigFilters = {
    categorySlugs,
    subcategorySlugs,
    q,
    maxPrice: butce ? Number(butce) : undefined,
    maxDeliveryDays: sure && sure !== "farketmez" ? Number(sure) : undefined,
    onlineSellersOnly: cevrimici,
    proSellersOnly: proOnly,
    sort: sirala ?? "uygun",
    page: sayfa,
    pageSize: PAGE_SIZE,
  };

  const [categories, subcategories, { cards: gigs, page, pageCount }] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true, icon: true } }),
    prisma.subcategory.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true, category: { select: { slug: true } } },
    }),
    listGigs(filters),
  ]);

  const subcategoriesByCategory: Record<string, { name: string; slug: string }[]> = {};
  for (const sc of subcategories) {
    (subcategoriesByCategory[sc.category.slug] ??= []).push({ name: sc.name, slug: sc.slug });
  }

  const selectedCategoryObjects = categories.filter((c) => categorySlugs.includes(c.slug));
  const selectedSubcategoryObjects = subcategories.filter((sc) => subcategorySlugs.includes(sc.slug));
  const singleCategory = selectedCategoryObjects.length === 1 ? selectedCategoryObjects[0] : null;
  const singleSubcategory =
    selectedSubcategoryObjects.length === 1 ? selectedSubcategoryObjects[0] : null;
  const categorySummary = singleCategory ? await getCategoryFreelancerSummary(singleCategory.slug) : null;

  const heading = q
    ? `"${q}" için sonuçlar`
    : singleSubcategory
      ? singleSubcategory.name
      : singleCategory
        ? singleCategory.name
        : "Tüm Hizmetler";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">Kategoriler</span>
      </nav>

      {singleCategory && categorySummary ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-800 p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <CategoryIcon icon={singleCategory.icon} className="text-3xl" />
            </span>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">{singleCategory.name}</h1>
              <p className="mt-0.5 text-sm text-slate-300">
                Bu kategoride hizmet sunan{" "}
                <span className="font-semibold text-white">
                  {categorySummary.total.toLocaleString("tr-TR")}
                </span>{" "}
                freelancer var.
              </p>
            </div>
          </div>
          {categorySummary.sample.length > 0 && (
            <div className="flex shrink-0 -space-x-3">
              {categorySummary.sample.map((freelancer) => (
                <UserAvatar
                  key={freelancer.id}
                  name={freelancer.name}
                  image={freelancer.image}
                  className="h-10 w-10 border-2 border-slate-800 text-sm"
                />
              ))}
              {categorySummary.total > categorySummary.sample.length && (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-600 text-xs font-bold">
                  +{(categorySummary.total - categorySummary.sample.length).toLocaleString("tr-TR")}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{heading}</h1>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <FilterBar
          categories={categories}
          subcategoriesByCategory={subcategoriesByCategory}
          selectedCategories={categorySlugs}
          selectedSubcategories={subcategorySlugs}
          initialBudget={butce ? Number(butce) : 3000}
          initialDelivery={sure ?? "farketmez"}
          initialOnlineOnly={cevrimici}
          isProBuyer={isProBuyer}
          initialProOnly={proOnly}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategoryObjects.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({
                categorySlugs: categorySlugs.filter((s) => s !== c.slug),
                subcategorySlugs,
                q,
                butce,
                sure,
                sirala,
                cevrimici,
                pro: proOnly,
              })}
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
            >
              {c.name}
              <span aria-hidden>×</span>
            </Link>
          ))}
          {selectedSubcategoryObjects.map((sc) => (
            <Link
              key={sc.slug}
              href={buildHref({
                categorySlugs,
                subcategorySlugs: subcategorySlugs.filter((s) => s !== sc.slug),
                q,
                butce,
                sure,
                sirala,
                cevrimici,
                pro: proOnly,
              })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              {sc.name}
              <span aria-hidden>×</span>
            </Link>
          ))}
        </div>
        <SortSelect value={filters.sort ?? "uygun"} />
      </div>

      <div className="mt-6">
        {gigs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <CategoryIcon icon="sparkles" className="text-3xl" />
            </div>
            <p className="mt-4 font-medium text-slate-600">Aramanıza uygun hizmet bulunamadı.</p>
            <p className="mt-1 text-sm text-slate-400">Filtreleri değiştirip tekrar dene.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gigs.map((gig) => (
                <GigCard key={gig.slug} gig={gig} />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={buildHref({ categorySlugs, subcategorySlugs, q, butce, sure, sirala, cevrimici, pro: proOnly, sayfa: page - 1 })}
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
                    href={buildHref({ categorySlugs, subcategorySlugs, q, butce, sure, sirala, cevrimici, pro: proOnly, sayfa: n })}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      n === page ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                <span className="text-xs text-slate-400">/ {pageCount}</span>
                <Link
                  href={buildHref({ categorySlugs, subcategorySlugs, q, butce, sure, sirala, cevrimici, pro: proOnly, sayfa: page + 1 })}
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
    </div>
  );
}
