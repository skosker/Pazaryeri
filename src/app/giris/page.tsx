import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Giriş Yap</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hesabına giriş yap, siparişlerini ve ilanlarını yönet.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-purple-700 hover:underline">
          Kayıt Ol
        </Link>
      </p>

      <div className="mt-8 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Demo hesap</p>
        <p>alici: buyer@profestia.dev · satıcı: mert@profestia.dev</p>
        <p>şifre: password123</p>
      </div>
    </div>
  );
}
