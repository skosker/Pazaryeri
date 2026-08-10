import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BecomeFreelancerForm } from "./become-freelancer-form";

export default async function FreelancerOlPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/freelancer-ol");
  if (session.user.role !== "BUYER") redirect("/panel");

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-navy">Freelancer Ol</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hesabın freelancer hesabına dönüşür, ilan yayınlayıp hizmet vermeye başlayabilirsin.
        Alıcı olarak sipariş verme hakkını kaybetmezsin.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Ücretsiz, gizli komisyon yok
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Fiyatını ve teslim sürini sen belirlersin
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">✓</span> Ödemen onay sonrası hesabına geçer
        </li>
      </ul>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BecomeFreelancerForm />
      </div>
    </div>
  );
}
