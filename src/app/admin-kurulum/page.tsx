import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { AdminSetupForm } from "./setup-form";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminSetupPage() {
  // No token configured means no recovery in progress, so the route should not
  // even advertise its existence.
  if (!process.env.ADMIN_SETUP_TOKEN) notFound();

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-brand-navy">Admin Kurulumu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Yönetici hesabına yeni bir şifre belirle. İşin bitince Vercel&apos;den
        <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_SETUP_TOKEN</code>
        değişkenini sil; bu sayfa yeniden kapanır.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AdminSetupForm />
      </div>
    </AuthShell>
  );
}
