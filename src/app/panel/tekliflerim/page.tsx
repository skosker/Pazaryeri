import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { isOpen, offerUsage, timeAgo } from "@/lib/job-requests";

function statusOf(offer: { status: string; request: { status: string; expiresAt: Date } }) {
  if (offer.status === "ACCEPTED") return { label: "Kabul edildi", tone: "bg-purple-50 text-purple-700" };
  if (offer.status === "WITHDRAWN") return { label: "Geri çekildi", tone: "bg-slate-100 text-slate-500" };
  if (offer.status === "DECLINED" || !isOpen(offer.request)) return { label: "Sonuçlandı", tone: "bg-slate-100 text-slate-500" };
  return { label: "Bekliyor", tone: "bg-emerald-50 text-emerald-700" };
}

export default async function MyOffersPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/tekliflerim");
  if (session.user.role !== "FREELANCER") redirect("/panel");
  if (!(await getSettings()).jobRequestsEnabled) notFound();

  const [usage, offers] = await Promise.all([
    offerUsage(session.user.id),
    prisma.jobOffer.findMany({
      where: { sellerId: session.user.id, request: { status: { not: "REMOVED" } } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, price: true, deliveryDays: true, status: true, orderId: true, createdAt: true,
        request: { select: { id: true, title: true, status: true, expiresAt: true } },
      },
    }),
  ]);
  const percent = usage.quota > 0 ? Math.min(100, Math.round((usage.used / usage.quota) * 100)) : 100;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Tekliflerim</h1>
          <p className="mt-1 text-sm text-slate-500">İş taleplerine verdiğin teklifler.</p>
        </div>
        <Link href="/is-talepleri" className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          İş Taleplerine Göz At
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-brand-navy">Bu Ayki Teklif Hakkın</p>
          <p className="text-slate-600">
            <strong className="text-brand-navy">{usage.used}</strong> / {usage.quota} kullanıldı · {usage.left} kaldı
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="brand-gradient h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Hak her ayın başında yenilenir. Verdiğin teklifi güncellemek hak kullanmaz.
          {usage.tier !== "PRO_PLUS" && (
            <>
              {" "}
              <Link href="/panel/pro-ol" className="font-semibold text-purple-700 hover:underline">
                {usage.tier === "PRO" ? "Pro Plus" : "Pro"} ile daha fazla teklif ver
              </Link>
            </>
          )}
        </p>
      </div>

      {offers.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Henüz teklif vermedin. Alıcıların açtığı taleplere göz at, işine uygun olanlara teklif ver.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {offers.map((o) => {
            const s = statusOf(o);
            return (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 last:border-0">
                <div className="min-w-0">
                  <Link href={`/is-talepleri/${o.request.id}`} className="font-semibold text-brand-navy hover:underline">
                    {o.request.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatPrice(Number(o.price))} TL · {o.deliveryDays} gün · {timeAgo(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {o.status === "ACCEPTED" && o.orderId && (
                    <Link href={`/siparis/${o.orderId}`} className="text-xs font-semibold text-purple-700 hover:underline">
                      Siparişe Git
                    </Link>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.tone}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
