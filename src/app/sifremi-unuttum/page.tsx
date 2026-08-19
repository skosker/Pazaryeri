import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-brand-navy">Şifremi Unuttum</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hesabının e-posta adresini gir, yeni şifre belirlemen için bir bağlantı gönderelim.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Şifreni hatırladın mı?{" "}
        <Link href="/giris" className="font-semibold text-purple-700 hover:underline">
          Giriş Yap
        </Link>
      </p>
    </AuthShell>
  );
}
