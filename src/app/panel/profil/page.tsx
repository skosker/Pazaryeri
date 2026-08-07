import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/profil");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, title: true, bio: true, role: true },
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
        />
      </div>
    </div>
  );
}
