import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { RequestForm } from "./request-form";

export default async function NewJobRequestPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/is-taleplerim/yeni");
  const settings = await getSettings();
  if (!settings.jobRequestsEnabled) notFound();
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  return (
    <div className="max-w-2xl">
      <Link href="/panel/is-taleplerim" className="text-sm text-slate-500 hover:text-brand-navy">
        ← İş Taleplerim
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Yeni İş Talebi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Talebin hemen yayına girer ve {settings.jobRequestDays} gün açık kalır. Freelancer&apos;lar teklif verdikçe e-posta
        ile haber veririz; beğendiğin teklifi kabul edip Prosinta güvencesiyle ödersin.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RequestForm categories={categories} />
      </div>
    </div>
  );
}
