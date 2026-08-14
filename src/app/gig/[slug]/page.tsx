import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getGigBySlug, getRelatedGigs } from "@/lib/gigs";
import { GigCover } from "@/components/gig-cover";
import { StarRating } from "@/components/star-rating";
import { GigCard } from "@/components/gig-card";
import { OrderPanel } from "./order-panel";

function sellerLevelLabel(reviewCount: number) {
  if (reviewCount === 0) return "Yeni Satıcı";
  if (reviewCount >= 50) return "Level 2 Satıcı";
  return "Level 1 Satıcı";
}

export default async function GigDetailPage(props: PageProps<"/gig/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();

  const gig = await getGigBySlug(slug);
  if (!gig) notFound();

  if (gig.packages.length === 0) notFound();

  const reviewCount = gig.reviews.length;
  const rating =
    reviewCount > 0
      ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const errorMessage = typeof searchParams.hata === "string" ? searchParams.hata : null;
  const relatedGigs = await getRelatedGigs(gig.category.slug, gig.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-brand-navy">
          Ana Sayfa
        </Link>{" "}
        /{" "}
        <Link href={`/kategoriler?kategori=${gig.category.slug}`} className="hover:text-brand-navy">
          {gig.category.name}
        </Link>{" "}
        /{" "}
        {gig.subcategory && (
          <>
            <Link
              href={`/kategoriler?kategori=${gig.category.slug}&alt=${gig.subcategory.slug}`}
              className="hover:text-brand-navy"
            >
              {gig.subcategory.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-slate-500">{gig.title}</span>
      </nav>

      {errorMessage && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{gig.title}</h1>

          <Link href={`/freelancer/${gig.seller.id}`} className="mt-4 flex items-center gap-3 hover:opacity-80">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              {gig.seller.name.charAt(0)}
              {gig.seller.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-navy">{gig.seller.name}</p>
              <p className="text-xs text-slate-400">
                {gig.seller.title ?? "Freelancer"}
              </p>
            </div>
            <span className="ml-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {sellerLevelLabel(reviewCount)}
            </span>
            {gig.seller.isPro && (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
                Pro
              </span>
            )}
            {rating !== null && <StarRating rating={rating} count={reviewCount} />}
          </Link>

          <div className="relative mt-6 h-72 overflow-hidden rounded-2xl bg-slate-100">
            <GigCover
              categorySlug={gig.category.slug}
              categoryIcon={gig.category.icon}
              gigSlug={gig.slug}
              coverColor={gig.coverColor}
              size="1200/800"
              alt={gig.title}
              iconClassName="h-24 w-24"
            />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-brand-navy">Bu hizmet hakkında</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">{gig.description}</p>
          </section>

          <section className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-brand-navy">Satıcı hakkında</h2>
            <Link href={`/freelancer/${gig.seller.id}`} className="mt-4 flex items-start gap-4 hover:opacity-80">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-600">
                {gig.seller.name.charAt(0)}
                {gig.seller.isOnline && (
                  <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-brand-navy">{gig.seller.name}</p>
                  {gig.seller.isPro && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{gig.seller.title ?? "Freelancer"}</p>
                {gig.seller.bio && <p className="mt-2 max-w-xl text-sm text-slate-600">{gig.seller.bio}</p>}
              </div>
            </Link>
          </section>

          <section className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-brand-navy">
              Değerlendirmeler {reviewCount > 0 && `(${reviewCount})`}
            </h2>
            {reviewCount === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Bu hizmet için henüz değerlendirme yapılmadı.</p>
            ) : (
              <ul className="mt-4 space-y-5">
                {gig.reviews.map((review) => (
                  <li key={review.id} className="border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-brand-navy">{review.buyer.name}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <OrderPanel
          slug={gig.slug}
          packages={gig.packages.map((p) => ({
            id: p.id,
            tier: p.tier,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            deliveryDays: p.deliveryDays,
            revisionCount: p.revisionCount,
            features: p.features,
          }))}
          isOwnGig={session?.user?.id === gig.sellerId}
        />
      </div>

      {relatedGigs.length > 0 && (
        <section className="mt-16 border-t border-slate-100 pt-10">
          <h2 className="text-lg font-semibold text-brand-navy">
            {gig.category.name} kategorisinde diğer hizmetler
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGigs.map((related) => (
              <GigCard key={related.slug} gig={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
