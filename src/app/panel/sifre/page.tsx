import { ChangePasswordForm } from "./change-password-form";

export default function ChangePasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Şifre Değiştir</h1>
      <p className="mt-1 text-sm text-slate-500">
        Yeni şifreni belirlemek için önce mevcut şifreni gir.
      </p>

      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
