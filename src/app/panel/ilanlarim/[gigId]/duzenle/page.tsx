import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GigForm } from "@/app/panel/ilan-olustur/gig-form";
import { updateGigAction } from "./actions";

export default async function EditGigPage(props: PageProps<"/panel/ilanlarim/[gigId]/duzenle">) {
  const { gigId } = await props.params;

  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/ilanlarim");

  const [gig, categories] = await Promise.all([
    prisma.gig.findUnique({
      where: { id: gigId },
      include: { packages: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!gig || gig.sellerId !== session.user.id) notFound();

  const tierValues = (tier: "BASIC" | "STANDARD" | "PREMIUM") => {
    const pkg = gig.packages.find((p) => p.tier === tier);
    if (!pkg) return undefined;
    return {
      price: Number(pkg.price),
      deliveryDays: pkg.deliveryDays,
      revisionCount: pkg.revisionCount,
      description: pkg.description,
    };
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-navy">İlanı Düzenle</h1>
      <p className="mt-1 text-sm text-slate-500">Değişiklikler kaydedince hemen yayına yansır.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GigForm
          categories={categories}
          action={updateGigAction.bind(null, gig.id)}
          submitLabel="Değişiklikleri Kaydet"
          pendingLabel="Kaydediliyor..."
          defaultValues={{
            title: gig.title,
            categoryId: gig.categoryId,
            description: gig.description,
            coverImage: gig.coverImage,
            basic: tierValues("BASIC"),
            standard: tierValues("STANDARD"),
            premium: tierValues("PREMIUM"),
          }}
        />
      </div>
    </div>
  );
}
