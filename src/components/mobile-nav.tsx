"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/search-bar";

type NavUser = { name?: string | null; role?: string } | null;

export function MobileNav({
  user,
  signOutAction,
}: {
  user: NavUser;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isFreelancerProfile = pathname?.startsWith("/freelancer/");

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menüyü aç"
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy hover:bg-slate-100"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-4 py-4 shadow-lg">
          <SearchBar />
          <nav className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-600">
            {!isFreelancerProfile && (
              <Link href="/kategoriler" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 hover:bg-slate-50">
                Kategoriler
              </Link>
            )}
            <Link href="/nasil-calisir" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 hover:bg-slate-50">
              Nasıl Çalışır
            </Link>
            {!user && (
              <Link
                href="/kayit?role=FREELANCER"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 hover:bg-slate-50"
              >
                Freelancer Ol
              </Link>
            )}
            {user && (
              <Link href="/panel" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 hover:bg-slate-50">
                Panelim
              </Link>
            )}
            {user?.role === "BUYER" && (
              <Link
                href="/panel/freelancer-ol"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 hover:bg-slate-50"
              >
                Freelancer Ol
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 hover:bg-slate-50">
                Admin
              </Link>
            )}
          </nav>

          {user && (
            <form action={signOutAction} className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="submit"
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-brand-navy"
              >
                Çıkış Yap
              </button>
            </form>
          )}

          {!user && (
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-brand-navy"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                onClick={() => setOpen(false)}
                className="brand-gradient flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
