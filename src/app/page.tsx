import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { GigCard } from "@/components/gig-card";
import { CategoryIcon } from "@/components/category-icon";
import { getFeaturedGigs } from "@/lib/gigs";
import { prisma } from "@/lib/prisma";

const quickChips = [
  "Sosyal Medya Yönetimi",
  "Logo & Marka Kimliği",
  "Web Sitesi Kurulumu",
  "SEO İçerik Yazımı",
  "Reklam Yönetimi",
];

export default async function Home() {
  const [gigs, categories, gigCount, freelancerCount] = await Promise.all([
    getFeaturedGigs(6),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.gig.count(),
    prisma.user.count({ where: { role: "FREELANCER" } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-200 via-purple-200 to-indigo-200 opacity-40 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-semibold text-purple-700">
            Profesyonel Hizmette Yeni Nesil Platform
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Doğru Uzman, Doğru Hizmet, Doğru Sonuç
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
            İşini bilen freelancer&apos;larla
            <br /> projeni hayata geçir
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-500">
            Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç,
            dakikalar içinde işine başla.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickChips.map((chip) => (
              <Link
                key={chip}
                href={`/kategoriler?q=${encodeURIComponent(chip)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-purple-300 hover:text-purple-700"
              >
                {chip}
              </Link>
            ))}
          </div>

          <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <Stat value={`${categories.length}`} label="Kategori" />
            <Stat value={`${gigCount}+`} label="Hizmet" />
            <Stat value={`${freelancerCount}+`} label="Freelancer" />
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold text-brand-navy">Kategorilere Göz At</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategoriler?kategori=${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100"
            >
              <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-white transition group-hover:scale-105">
                <CategoryIcon icon={c.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-brand-navy">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-navy">Öne Çıkan Hizmetler</h2>
          <Link href="/kategoriler" className="text-sm font-semibold text-purple-700 hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <GigCard key={gig.slug} gig={gig} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <Feature
            title="iyzico güvencesiyle ödeme"
            description="İş onaylanmadan ödeme satıcıya aktarılmaz."
          />
          <Feature
            title="Doğrulanmış freelancer'lar"
            description="Değerlendirmeler ve tamamlanan iş geçmişiyle güvenle seç."
          />
          <Feature
            title="7/24 destek"
            description="Sipariş sürecinde her adımda yanındayız."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-extrabold text-brand-navy">{value}</dd>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-6 transition hover:shadow-lg hover:shadow-slate-100">
      <div className="mb-3 h-9 w-9 rounded-full brand-gradient" />
      <h3 className="font-semibold text-brand-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
