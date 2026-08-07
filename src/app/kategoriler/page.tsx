import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listGigs, type GigFilters } from "@/lib/gigs";
import { GigCard } from "@/components/gig-card";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryAccent } from "@/lib/category-style";
import { FiltersSidebar } from "./filters-sidebar";
import { SortSelect } from "./sort-select";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toSingle(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(base: {
  categorySlugs: string[];
  q?: string;
  butce?: string;
  sure?: string;
  sirala?: string;
}) {
  const search = new URLSearchParams();
  base.categorySlugs.forEach((slug) => search.append("kategori", slug));
  if (base.q) search.set("q", base.q);
  if (base.butce) search.set("butce", base.butce);
  if (base.sure) search.set("sure", base.sure);
  if (base.sirala) search.set("sirala", base.sirala);
  const qs = search.toString();
  return qs ? `/kategoriler?${qs}` : "/kategoriler";
}

export default async function KategorilerPage(props: PageProps<"/kategoriler">) {
  const searchParams = await props.searchParams;

  const categorySlugs = toArray(searchParams.kategori);
  const q = toSingle(searchParams.q);
  const butce = toSingle(searchParams.butce);
  const sure = toSingle(searchParams.sure);
  const sirala = toSingle(searchParams.sirala) as GigFilters["sort"];

  const filters: GigFilters = {
    categorySlugs,
    q,
    maxPrice: butce ? Number(butce) : undefined,
    maxDeliveryDays: sure && sure !== "farketmez" ? Number(sure) : undefined,
    sort: sirala ?? "uygun",
  };

  const [categories, gigs] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, icon: true } }),
    listGigs(filters),
  ]);

  const selectedCategoryObjects = categories.filter((c) => categorySlugs.includes(c.slug));
  const singleCategory = selectedCategoryObjects.length === 1 ? selectedCategoryObjects[0] : null;
  const accent = singleCategory ? getCategoryAccent(singleCategory.slug) : null;

  const heading = q ? `"${q}" için sonuçlar` : singleCategory ? singleCategory.name : "Tüm Hizmetler";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">Kategoriler</span>
      </nav>

      <div className="mb-8 flex items-center gap-3">
        {accent && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
            <CategoryIcon icon={singleCategory!.icon} className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-brand-navy">{gigs.length}</span> hizmet listeleniyor
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <FiltersSidebar
          categories={categories}
          selectedCategories={categorySlugs}
          initialBudget={butce ? Number(butce) : 3000}
          initialDelivery={sure ?? "farketmez"}
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategoryObjects.map((c) => (
                <Link
                  key={c.slug}
                  href={buildHref({
                    categorySlugs: categorySlugs.filter((s) => s !== c.slug),
                    q,
                    butce,
                    sure,
                    sirala,
                  })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                >
                  {c.name}
                  <span aria-hidden>×</span>
                </Link>
              ))}
            </div>
            <SortSelect value={filters.sort ?? "uygun"} />
          </div>

          {gigs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CategoryIcon icon="sparkles" className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium text-slate-600">Aramanıza uygun hizmet bulunamadı.</p>
              <p className="mt-1 text-sm text-slate-400">Filtreleri değiştirip tekrar dene.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gigs.map((gig) => (
                <GigCard key={gig.slug} gig={gig} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
