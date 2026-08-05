import Link from "next/link";
import { RegisterForm } from "./register-form";

export default async function RegisterPage(props: PageProps<"/kayit">) {
  const searchParams = await props.searchParams;
  const defaultRole = searchParams.role === "FREELANCER" ? "FREELANCER" : "BUYER";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Kayıt Ol</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ücretsiz hesap oluştur, hizmet al ya da freelancer olarak ilan ver.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm defaultRole={defaultRole} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-purple-700 hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
