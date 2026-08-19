import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { checkResetToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-form";

const problems: Record<string, string> = {
  invalid: "Bu bağlantı geçerli değil. Bağlantıyı eksiksiz kopyaladığından emin ol.",
  expired: "Bağlantının süresi dolmuş. Bağlantılar 1 saat geçerli.",
  used: "Bu bağlantı zaten kullanılmış. Şifreni yeniden değiştirmek istiyorsan yeni bir istek gönder.",
};

export default async function ResetPasswordPage(props: PageProps<"/sifre-sifirla">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  // Checked before the form is drawn, so a dead link says why instead of letting someone
  // type a new password and only then refusing it.
  const state = await checkResetToken(token);

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-brand-navy">Yeni Şifre Belirle</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hesabın için yeni bir şifre seç. En az 6 karakter olmalı.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {state === "valid" ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">
              ✕
            </div>
            <p className="mt-3 font-semibold text-brand-navy">Bağlantı kullanılamıyor</p>
            <p className="mt-1 text-sm text-slate-500">{problems[state]}</p>
            <Link
              href="/sifremi-unuttum"
              className="brand-gradient mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Yeni Bağlantı İste
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
