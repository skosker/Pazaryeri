import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { CategoryMegaMenu } from "@/components/category-mega-menu";

export async function Header() {
  const [session, categories, subcategories] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, icon: true } }),
    prisma.subcategory.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true, category: { select: { slug: true } } },
    }),
  ]);

  const subcategoriesByCategory: Record<string, { name: string; slug: string }[]> = {};
  for (const sc of subcategories) {
    (subcategoriesByCategory[sc.category.slug] ??= []).push({ name: sc.name, slug: sc.slug });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <CategoryMegaMenu categories={categories} subcategoriesByCategory={subcategoriesByCategory} />
          <Link href="/nasil-calisir" className="transition hover:text-brand-navy">
            Nasıl Çalışır
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {!session?.user && (
            <Link
              href="/kayit?role=FREELANCER"
              className="hidden text-sm font-medium text-slate-600 hover:text-brand-navy md:block"
            >
              Freelancer Ol
            </Link>
          )}

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden text-sm font-medium text-slate-600 hover:text-brand-navy md:block"
                >
                  Admin
                </Link>
              )}
              {session.user.role === "BUYER" && (
                <Link
                  href="/panel/freelancer-ol"
                  className="hidden text-sm font-medium text-slate-600 hover:text-brand-navy md:block"
                >
                  Freelancer Ol
                </Link>
              )}
              <Link
                href="/panel"
                className="hidden text-sm font-medium text-slate-600 hover:text-brand-navy md:block"
              >
                {session.user.name?.split(" ")[0]} · Panelim
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
                className="hidden md:block"
              >
                <button
                  type="submit"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-slate-50"
                >
                  Çıkış Yap
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/giris"
                className="hidden text-sm font-medium text-slate-600 hover:text-brand-navy sm:block"
              >
                Giriş Yap
              </Link>
              <LinkButton href="/kayit" className="hidden sm:inline-flex">
                Kayıt Ol
              </LinkButton>
            </>
          )}

          <MobileNav
            user={session?.user ?? null}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        </div>
      </div>
    </header>
  );
}
