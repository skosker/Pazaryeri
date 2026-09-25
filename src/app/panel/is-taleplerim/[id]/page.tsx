import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { messageLink } from "@/lib/messaging";
import { membershipSelect, membershipTier } from "@/lib/membership";
import { budgetLabel, isOpen, timeAgo } from "@/lib/job-requests";
import { UserAvatar } from "@/components/user-avatar";
import { ProBadge } from "@/components/pro-badge";
import { FounderBadge } from "@/components/founder-badge";
import { acceptOfferAction, closeRequestAction } from "../actions";

const OFFER_STATUS: Record<string, string> = {
  ACCEPTED: "Kabul edildi",
  DECLINED: "Sonuçlandı",
};

export default async function ManageJobRequestPage(props: PageProps<"/panel/is-taleplerim/[id]">) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/panel/is-taleplerim/${id}`);
  if (!(await getSettings()).jobRequestsEnabled) notFound();

  const request = await prisma.jobRequest.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, budgetMin: true, budgetMax: true, deliveryDays: true,
      status: true, expiresAt: true, createdAt: true, buyerId: true,
      category: { select: { name: true } },
      offers: {
        where: { status: { not: "WITHDRAWN" } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, price: true, deliveryDays: true, message: true, status: true, orderId: true, createdAt: true,
          gig: { select: { title: true, slug: true } },
          seller: {
            select: {
              id: true, name: true, title: true, image: true, founderNumber: true, emailVerified: true,
              ...membershipSelect,
            },
          },
        },
      },
    },
  });
  if (!request || request.buyerId !== session.user.id || request.status === "REMOVED") notFound();

  // Each freelancer's rating across all their gigs, the same figure their profile shows.
  const sellerIds = request.offers.map((o) => o.seller.id);
  const reviews = sellerIds.length
    ? await prisma.review.findMany({
        where: { gig: { sellerId: { in: sellerIds } } },
        select: { rating: true, gig: { select: { sellerId: true } } },
      })
    : [];
  const ratings = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    const cur = ratings.get(r.gig.sellerId) ?? { sum: 0, count: 0 };
    ratings.set(r.gig.sellerId, { sum: cur.sum + r.rating, count: cur.count + 1 });
  }

  const open = isOpen(request);
  const hired = request.offers.find((o) => o.status === "ACCEPTED");
  const error = typeof query.hata === "string" ? query.hata : null;

  return (
    <div className="max-w-3xl">
      <Link href="/panel/is-taleplerim" className="text-xs text-slate-400 hover:text-slate-600">
        ← İş Taleplerim
      </Link>

      {query.yeni === "1" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Talebin yayında. Gelen teklifler burada listelenir; yeni teklif gelince e-postayla haber veririz.
        </p>
      )}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-brand-navy">{request.title}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {request.category.name} · {budgetLabel(request.budgetMin, request.budgetMax)} · {request.deliveryDays} gün ·{" "}
              {timeAgo(request.createdAt)} açıldı
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/is-talepleri/${request.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300">
              Yayındaki Hali
            </Link>
            {open && (
              <form action={closeRequestAction.bind(null, request.id)}>
                <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:text-red-600">
                  Talebi Kapat
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{request.description}</p>
        {open ? (
          <p className="mt-4 text-xs text-slate-400">
            {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(request.expiresAt)}{" "}
            tarihine kadar teklif alır.
          </p>
        ) : (
          <p className="mt-4 text-xs font-semibold text-slate-500">
            {request.status === "HIRED" ? "Freelancer seçildi." : "Bu talep kapandı, yeni teklif almıyor."}
          </p>
        )}
      </div>

      {hired?.orderId && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm text-purple-900">
            <strong>{hired.seller.name}</strong> ile anlaştın. Ödemeyi tamamlamadıysan siparişten devam edebilirsin.
          </p>
          <Link href={`/siparis/${hired.orderId}`} className="rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800">
            Siparişe Git
          </Link>
        </div>
      )}

      <h2 className="mt-8 text-lg font-bold text-brand-navy">Gelen Teklifler ({request.offers.length})</h2>
      {request.offers.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {open ? "Henüz teklif gelmedi. Freelancer'lar talebini gördükçe teklifler burada görünecek." : "Bu talebe teklif gelmedi."}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {request.offers.map((o) => {
            const tier = membershipTier(o.seller);
            const rating = ratings.get(o.seller.id);
            const canAccept = open && o.status === "PENDING";
            return (
              <div
                key={o.id}
                className={`rounded-2xl border bg-white p-5 ${o.status === "ACCEPTED" ? "border-purple-300" : "border-slate-200"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={o.seller.name} image={o.seller.image} className="h-11 w-11 shrink-0 text-sm" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 font-semibold text-brand-navy">
                        <Link href={`/freelancer/${o.seller.id}`} className="hover:underline">
                          {o.seller.name}
                        </Link>
                        {o.seller.emailVerified && (
                          <span title="E-posta doğrulandı" className="text-emerald-500">✓</span>
                        )}
                        {tier && <ProBadge plus={tier === "PRO_PLUS"} size="xs" />}
                        {o.seller.founderNumber && <FounderBadge compact />}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rating ? (
                          <>
                            <span className="text-amber-500">★</span> {(rating.sum / rating.count).toFixed(1)} ({rating.count} değerlendirme)
                          </>
                        ) : (
                          "Henüz değerlendirme yok"
                        )}
                        {o.seller.title ? ` · ${o.seller.title}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-navy">{formatPrice(Number(o.price))} TL</p>
                    <p className="text-xs text-slate-500">{o.deliveryDays} günde teslim</p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{o.message}</p>
                <p className="mt-3 text-xs text-slate-400">
                  İlan:{" "}
                  <Link href={`/gig/${o.gig.slug}`} className="text-purple-700 hover:underline">
                    {o.gig.title}
                  </Link>{" "}
                  · {timeAgo(o.createdAt)}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  {OFFER_STATUS[o.status] && (
                    <span className="mr-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {OFFER_STATUS[o.status]}
                    </span>
                  )}
                  <Link
                    href={messageLink(o.seller.id, true)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
                  >
                    Mesaj Gönder
                  </Link>
                  {canAccept && (
                    <form action={acceptOfferAction.bind(null, request.id, o.id)}>
                      <button className="brand-gradient rounded-full px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                        Teklifi Kabul Et
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {open && request.offers.some((o) => o.status === "PENDING") && (
        <p className="mt-4 text-xs text-slate-500">
          Kabul ettiğin teklif için sipariş açılır ve ödeme sayfasına geçersin. Ödeme Prosinta&apos;da güvende tutulur, iş
          teslim edilip onaylanınca freelancer&apos;a aktarılır. Diğer teklifler kapanır.
        </p>
      )}
    </div>
  );
}
