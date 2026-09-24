import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { CompanyForm } from "./company-form";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/profil");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      title: true,
      bio: true,
      role: true,
      image: true,
      pendingImage: true,
      companyName: true,
      taxOffice: true,
      taxNumber: true,
      billingAddress: true,
    },
  });
  if (!user) redirect("/giris");

  const isFreelancer = user.role === "FREELANCER";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Profilim</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isFreelancer
          ? "Bu bilgiler ilan sayfalarında alıcılara gösterilir."
          : "Hesap bilgilerini güncelle."}
      </p>

      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-slate-500">
          E-posta <span className="font-medium text-slate-600">{user.email}</span>
        </p>
        <ProfileForm
          isFreelancer={isFreelancer}
          defaultValues={{ name: user.name, title: user.title ?? "", bio: user.bio ?? "" }}
          image={user.image}
          pending={Boolean(user.pendingImage)}
        />
      </div>

      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-brand-navy">Fatura Bilgileri</h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Şirket adına alım yapıyorsan kurumsal bilgilerini gir; faturaların şirket unvanına düzenlenir.
        </p>
        <CompanyForm
          values={
            user.companyName
              ? {
                  companyName: user.companyName,
                  taxOffice: user.taxOffice ?? "",
                  taxNumber: user.taxNumber ?? "",
                  billingAddress: user.billingAddress ?? "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}
