import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getGigBySlug } from "@/lib/gigs";
import { coverGradientClass } from "@/lib/cover-colors";
import { StarRating } from "@/components/star-rating";
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

  const pkg = gig.packages[0];
  if (!pkg) notFound();

  const reviewCount = gig.reviews.length;
  const rating =
    reviewCount > 0
      ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const errorMessage = typeof searchParams.hata === "string" ? searchParams.hata : null;

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
        / <span className="text-slate-500">{gig.title}</span>
      </nav>

      {errorMessage && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{gig.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              {gig.seller.name.charAt(0)}
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
            {rating !== null && <StarRating rating={rating} count={reviewCount} />}
          </div>

          <div
            className={`mt-6 flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br ${coverGradientClass(
              gig.coverColor
            )}`}
          >
            <span className="rotate-[-8deg] text-sm font-semibold uppercase tracking-widest text-white/70">
              Gig Görseli
            </span>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-brand-navy">Bu hizmet hakkında</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">{gig.description}</p>
          </section>

          <section className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-brand-navy">Satıcı hakkında</h2>
            <div className="mt-4 flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-600">
                {gig.seller.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-brand-navy">{gig.seller.name}</p>
                <p className="text-sm text-slate-400">{gig.seller.title ?? "Freelancer"}</p>
                {gig.seller.bio && <p className="mt-2 max-w-xl text-sm text-slate-600">{gig.seller.bio}</p>}
              </div>
            </div>
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
          packageId={pkg.id}
          packageName={pkg.name}
          price={Number(pkg.price)}
          deliveryDays={pkg.deliveryDays}
          revisionCount={pkg.revisionCount}
          description={pkg.description}
          isOwnGig={session?.user?.id === gig.sellerId}
        />
      </div>
    </div>
  );
}
