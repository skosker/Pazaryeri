import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GigForm } from "./gig-form";

export default async function CreateGigPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/ilan-olustur");
  if (session.user.role !== "FREELANCER") redirect("/panel");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Yeni İlan Oluştur</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hizmetini tanımla, fiyat ve teslim süresini belirle.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GigForm categories={categories} />
      </div>
    </div>
  );
}
