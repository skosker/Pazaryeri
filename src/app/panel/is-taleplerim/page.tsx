import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { budgetLabel, isOpen, timeAgo } from "@/lib/job-requests";

export default async function MyJobRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/is-taleplerim");
  if (!(await getSettings()).jobRequestsEnabled) notFound();

  const requests = await prisma.jobRequest.findMany({
    where: { buyerId: session.user.id, status: { not: "REMOVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, budgetMin: true, budgetMax: true, status: true, expiresAt: true, createdAt: true,
      _count: { select: { offers: { where: { status: { not: "WITHDRAWN" } } } } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">İş Taleplerim</h1>
          <p className="mt-1 text-sm text-slate-500">Açtığın talepler ve gelen teklifler.</p>
        </div>
        <Link href="/panel/is-taleplerim/yeni" className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Yeni Talep
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Henüz talebin yok. Ne yaptırmak istediğini yaz, freelancer&apos;lar sana teklif versin.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((r) => {
            const open = isOpen(r);
            const label = r.status === "HIRED" ? "Freelancer seçildi" : open ? "Teklif alıyor" : "Kapandı";
            return (
              <Link
                key={r.id}
                href={`/panel/is-taleplerim/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-purple-200"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {budgetLabel(r.budgetMin, r.budgetMax)} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-700">{r._count.offers} teklif</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      open ? "bg-emerald-50 text-emerald-700" : r.status === "HIRED" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
