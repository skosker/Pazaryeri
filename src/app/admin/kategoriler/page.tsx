import { prisma } from "@/lib/prisma";
import { CategoryIcon, CATEGORY_EMOJI_KEYS } from "@/components/category-icon";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";
import { CreateCategoryForm } from "./create-category-form";

// Drawn from CategoryIcon's own emoji map, so a category using an icon this list once
// left out (as "cpu" and "chart" were) can never again default to the wrong option —
// the dropdown always covers everything CategoryIcon can actually render.
const ICON_OPTIONS = CATEGORY_EMOJI_KEYS;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { gigs: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Kategoriler</h1>
      <p className="mt-1 text-sm text-slate-500">{categories.length} kategori.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-brand-navy">Yeni Kategori Ekle</p>
        <CreateCategoryForm action={createCategoryAction} iconOptions={ICON_OPTIONS} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">İkon</th>
              <th className="px-5 py-3 font-medium">Ad</th>
              <th className="px-5 py-3 font-medium">İlan Sayısı</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const formId = `kategori-form-${category.id}`;
              return (
                <tr key={category.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                      <CategoryIcon icon={category.icon} className="text-lg" />
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      form={formId}
                      name="name"
                      defaultValue={category.name}
                      className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-brand-navy focus:border-purple-400 focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{category._count.gigs}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        form={formId}
                        name="icon"
                        defaultValue={category.icon}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 focus:border-purple-400 focus:outline-none"
                      >
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                      <button
                        form={formId}
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Kaydet
                      </button>
                      {/* A <form> can't wrap these <td>s directly — <tr> only permits
                          table cells as children, and browsers foster-parent anything
                          else out of the row, which desyncs from React's hydration.
                          Linking by the `form` attribute keeps one form per row without
                          nesting it in the table structure. */}
                      <form id={formId} action={updateCategoryAction.bind(null, category.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {categories.some((c) => c._count.gigs === 0) && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            İlansız kategoriler silinebilir
          </p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c._count.gigs === 0)
              .map((category) => (
                <form key={category.id} action={deleteCategoryAction.bind(null, category.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    {category.name} — Sil
                  </button>
                </form>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
