import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "./register-form";
import { RolePicker } from "./role-picker";

export default async function RegisterPage(props: PageProps<"/kayit">) {
  const searchParams = await props.searchParams;
  const role = searchParams.role === "FREELANCER" ? "FREELANCER" : searchParams.role === "BUYER" ? "BUYER" : null;

  // Signup opens on the role choice; the form only appears once a side is picked.
  if (!role) {
    return (
      <AuthShell wide>
        <RolePicker />
      </AuthShell>
    );
  }

  const sells = role === "FREELANCER";

  return (
    <AuthShell>
      <Link href="/kayit" className="text-sm text-slate-500 hover:text-brand-navy">
        ← Geri
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-navy">
        {sells ? "Hizmet Sağlayacağım (Freelancer)" : "Hizmet Satın Alacağım"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {sells
          ? "Hesabını oluştur, ilanını yayınla ve kazanmaya başla."
          : "Hesabını oluştur, aradığın hizmeti bul ve işe hemen başla."}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm role={role} />
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
