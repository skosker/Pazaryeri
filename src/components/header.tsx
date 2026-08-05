import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <Link href="/kategoriler" className="hover:text-brand-navy">
            Kategoriler
          </Link>
          <Link href="/nasil-calisir" className="hover:text-brand-navy">
            Nasıl Çalışır
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-md sm:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
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
                className="text-sm font-medium text-slate-600 hover:text-brand-navy"
              >
                Giriş Yap
              </Link>
              <LinkButton href="/kayit">Kayıt Ol</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
