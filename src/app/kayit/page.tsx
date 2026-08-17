import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "./register-form";

export default async function RegisterPage(props: PageProps<"/kayit">) {
  const searchParams = await props.searchParams;
  const wantsToSell = searchParams.role === "FREELANCER";

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-brand-navy">Kayıt Ol</h1>
      <p className="mt-1 text-sm text-slate-500">
        {wantsToSell
          ? "Hesabını oluştur; doğruladıktan sonra panelinden freelancer hesabına geçip ilan vermeye başlayabilirsin."
          : "Hesap oluştur, hizmet al ya da dilediğin zaman freelancer olarak ilan ver."}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm wantsToSell={wantsToSell} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-purple-700 hover:underline">
          Giriş Yap
        </Link>
      </p>
    </AuthShell>
  );
}
