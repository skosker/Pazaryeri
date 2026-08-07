import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryIcon } from "@/components/category-icon";
import { StarRating } from "@/components/star-rating";
import { LinkButton } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const quickChips = [
  "Logo & Marka Kimliği",
  "Web Sitesi Kurulumu",
  "Çeviri Hizmeti",
  "Video Kurgu",
  "Reklam Yönetimi",
  "Seslendirme",
  "İş Danışmanlığı",
  "Online Ders",
];

export default async function Home() {
  const [categories, gigCount, freelancerCount] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.gig.count(),
    prisma.user.count({ where: { role: "FREELANCER" } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
          <div>
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-white/80">
              Profesyonel Hizmette Yeni Nesil Platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              İhtiyacın olan hizmeti
              <br />
              <span className="brand-gradient-text">dakikalar içinde</span> bul
            </h1>
            <p className="mt-5 max-w-lg text-white/70">
              Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, işine
              hemen başla.
            </p>

            <div className="mt-8 max-w-lg">
              <SearchBar size="lg" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/60">
              <span className="font-medium">Popüler:</span>
              {quickChips.slice(0, 5).map((chip) => (
                <Link
                  key={chip}
                  href={`/kategoriler?q=${encodeURIComponent(chip)}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  {chip}
                </Link>
              ))}
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <Stat value={`${categories.length}`} label="Kategori" />
              <Stat value={`${gigCount}+`} label="Hizmet" />
              <Stat value={`${freelancerCount}+`} label="Freelancer" />
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold text-brand-navy">Popüler Kategoriler</h2>
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

      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy">Nasıl Çalışır?</h2>
          <p className="mt-2 text-sm text-slate-500">Üç adımda işini hayata geçir.</p>

          <div className="mt-10 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
            <HowStep n={1} title="Hizmeti bul" description="Kategorilere göz at, ihtiyacına en uygun ilanı seç." />
            <HowStep
              n={2}
              title="Güvenle öde"
              description="iyzico ile ödemeni yap, iş onaylanana kadar güvencede tutulur."
            />
            <HowStep n={3} title="İşini teslim al" description="Teslimatı onayla, ödeme satıcıya aktarılır." />
          </div>

          <Link
            href="/nasil-calisir"
            className="mt-10 inline-block text-sm font-semibold text-purple-700 hover:underline"
          >
            Detaylı incele →
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 opacity-25 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Yeteneğini bir hizmete dönüştür
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Ücretsiz kayıt ol, ilk ilanını dakikalar içinde yayınla ve kazanmaya başla.
          </p>
          <LinkButton href="/kayit?role=FREELANCER" className="mt-8">
            Freelancer Ol
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

function HeroPreviewCard() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
        <div className="h-40 overflow-hidden rounded-2xl brand-gradient" />
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            E
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-navy">Elif K.</p>
            <p className="text-xs text-slate-400">Sosyal Medya Uzmanı</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-brand-navy">
          Sosyal medya içerik tasarımı yapıyorum
        </p>
        <div className="mt-2">
          <StarRating rating={4.9} count={214} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-400">Başlangıç</span>
          <span className="text-lg font-extrabold text-brand-navy">350₺</span>
        </div>
      </div>

      <div className="absolute -bottom-14 -left-10 w-56 rounded-2xl border border-white/10 bg-white p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-brand-navy">Ödeme güvende</p>
            <p className="text-[11px] text-slate-400">iyzico ile korunuyor</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowStep({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
        {n}
      </span>
      <p className="mt-4 font-semibold text-brand-navy">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-extrabold text-white">{value}</dd>
      <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{label}</p>
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
