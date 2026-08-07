import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthShell>
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
    </AuthShell>
  );
}
