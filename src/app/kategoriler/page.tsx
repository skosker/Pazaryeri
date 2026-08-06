import { prisma } from "@/lib/prisma";
import { listGigs, type GigFilters } from "@/lib/gigs";
import { GigCard } from "@/components/gig-card";
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

  const resultLabel = q ? `"${q}"` : "Tüm Hizmetler";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <FiltersSidebar
          categories={categories}
          selectedCategories={categorySlugs}
          initialBudget={butce ? Number(butce) : 3000}
          initialDelivery={sure ?? "farketmez"}
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {resultLabel} için <span className="font-semibold text-brand-navy">{gigs.length}</span> sonuç
            </p>
            <SortSelect value={filters.sort ?? "uygun"} />
          </div>

          {gigs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
              Aramanıza uygun hizmet bulunamadı.
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
