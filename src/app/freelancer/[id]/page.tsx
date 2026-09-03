import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGigsBySeller } from "@/lib/gigs";
import { GigCard } from "@/components/gig-card";
import { StarRating } from "@/components/star-rating";
import { UserAvatar } from "@/components/user-avatar";
import { ReviewSummary } from "./review-summary";

function sellerLevelLabel(reviewCount: number) {
  if (reviewCount === 0) return "Yeni Satıcı";
  if (reviewCount >= 50) return "Level 2 Satıcı";
  return "Level 1 Satıcı";
}

export default async function FreelancerProfilePage(props: PageProps<"/freelancer/[id]">) {
  const { id } = await props.params;

  const freelancer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      title: true,
      bio: true,
      image: true,
      age: true,
      skills: true,
      isOnline: true,
      isPro: true,
      createdAt: true,
      role: true,
      suspended: true,
    },
  });

  if (!freelancer || freelancer.role !== "FREELANCER" || freelancer.suspended) notFound();

  const [gigs, reviewAgg, completedCount, cancelledCount, reviews] = await Promise.all([
    getGigsBySeller(freelancer.id),
    prisma.review.aggregate({
      where: { gig: { sellerId: freelancer.id } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.order.count({ where: { gig: { sellerId: freelancer.id }, status: "COMPLETED" } }),
    prisma.order.count({ where: { gig: { sellerId: freelancer.id }, status: "CANCELLED" } }),
    freelancer.isPro
      ? prisma.review.findMany({
          where: { gig: { sellerId: freelancer.id } },
          include: { buyer: { select: { name: true } }, gig: { select: { title: true, slug: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const reviewCount = reviewAgg._count;
  const rating = reviewAgg._avg.rating;
  const memberSince = freelancer.createdAt.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">{freelancer.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <span className="relative mx-auto block h-24 w-24">
              <UserAvatar name={freelancer.name} image={freelancer.image} className="h-24 w-24 text-3xl" />
              {freelancer.isOnline && (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </span>

            <h1 className="mt-4 text-lg font-bold text-brand-navy">{freelancer.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{freelancer.title ?? "Freelancer"}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {sellerLevelLabel(reviewCount)}
              </span>
              {freelancer.isPro && (
                <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
                  Pro
                </span>
              )}
            </div>

            {reviewCount > 0 && rating !== null && (
              <div className="mt-3 flex justify-center">
                <StarRating rating={rating} count={reviewCount} />
              </div>
            )}

            <button
              type="button"
              title="Yakında"
              disabled
              className="mt-5 w-full cursor-not-allowed rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-400"
            >
              Mesaj Gönder
            </button>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left text-sm">
              {freelancer.age !== null && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Yaş</dt>
                  <dd className="font-semibold text-brand-navy">{freelancer.age}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Tamamlanan Sipariş</dt>
                <dd className="font-semibold text-brand-navy">{completedCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">İptal Sayısı</dt>
                <dd className="font-semibold text-brand-navy">{cancelledCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Üyelik</dt>
                <dd className="font-semibold text-brand-navy">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Durum</dt>
                <dd className={`font-semibold ${freelancer.isOnline ? "text-emerald-600" : "text-slate-400"}`}>
                  {freelancer.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <div>
          {freelancer.bio && (
            <section>
              <h2 className="text-lg font-semibold text-brand-navy">Hakkımda</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{freelancer.bio}</p>
            </section>
          )}

          {freelancer.skills.length > 0 && (
            <section className={freelancer.bio ? "mt-8" : ""}>
              <h2 className="text-lg font-semibold text-brand-navy">Uzmanlık Alanları</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {freelancer.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            className={
              freelancer.bio || freelancer.skills.length > 0
                ? "mt-10 border-t border-slate-100 pt-8"
                : ""
            }
          >
            <h2 className="text-lg font-semibold text-brand-navy">
              {freelancer.name} kullanıcısının ilanları
              {gigs.length > 0 && <span className="ml-1 font-normal text-slate-400">({gigs.length})</span>}
            </h2>

            {gigs.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
                Bu freelancer&apos;ın henüz yayında bir ilanı yok.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {gigs.map((gig) => (
                  <GigCard key={gig.slug} gig={gig} />
                ))}
              </div>
            )}
          </section>

          {freelancer.isPro && (
            <section className="mt-10 border-t border-slate-100 pt-8">
              {reviewCount === 0 ? (
                <>
                  <h2 className="text-lg font-semibold text-brand-navy">Beğeni ve Yorumlar</h2>
                  <p className="mt-4 text-sm text-slate-400">Bu freelancer için henüz değerlendirme yapılmadı.</p>
                </>
              ) : (
                <ReviewSummary
                  total={reviewCount}
                  average={rating ?? 0}
                  reviews={reviews.map((review) => ({
                    id: review.id,
                    rating: review.rating,
                    comment: review.comment,
                    buyerName: review.buyer.name,
                    gigTitle: review.gig.title,
                    gigSlug: review.gig.slug,
                  }))}
                />
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
