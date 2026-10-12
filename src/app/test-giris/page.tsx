import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { peekLoginToken } from "@/lib/login-tokens";
import { testLoginAction } from "./actions";

export const metadata: Metadata = { title: "Test Hesabı Girişi", robots: { index: false, follow: false } };

/**
 * Where an admin's one-time test account link lands. Signing in takes a button press, not
 * just opening the URL, so a chat app's link preview cannot use the link up.
 */
export default async function TestLoginPage(props: PageProps<"/test-giris">) {
  const { t, hata } = await props.searchParams;
  const token = typeof t === "string" ? t : "";
  const [account, session] = await Promise.all([token ? peekLoginToken(token) : null, auth()]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Test Hesabı Girişi</p>
        {account ? (
          <>
            <h1 className="mt-2 text-2xl font-bold text-brand-navy">{account.name}</h1>
            <p className="mt-1 font-mono text-xs text-slate-500">{account.email}</p>
            {session?.user && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Bu tarayıcıda <strong>{session.user.name}</strong> olarak açık oturum var; devam edersen o oturum kapanır. Gizli
                pencerede açman önerilir.
              </p>
            )}
            <form action={testLoginAction.bind(null, token)} className="mt-6">
              <button className="brand-gradient w-full rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
                Bu Test Hesabıyla Giriş Yap
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-400">Link tek kullanımlıktır ve 10 dakika geçerlidir.</p>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-xl font-bold text-brand-navy">Link geçersiz</h1>
            <p className="mt-2 text-sm text-slate-500">
              {hata ? "Giriş yapılamadı: " : ""}Bu giriş linki kullanılmış ya da süresi dolmuş. Admin panelinden yeni bir link
              oluştur.
            </p>
            <Link href="/giris" className="mt-6 inline-block text-sm font-semibold text-purple-700 hover:underline">
              Normal giriş sayfası →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
