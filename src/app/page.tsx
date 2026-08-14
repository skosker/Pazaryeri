import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { LinkButton } from "@/components/ui/button";

export default function Home() {
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

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28 lg:px-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-fuchsia-400/50 bg-gradient-to-r from-fuchsia-500/25 via-purple-500/25 to-indigo-500/25 px-6 py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-fuchsia-500/20 sm:text-base">
              <svg className="h-4 w-4 shrink-0 text-fuchsia-300 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10 1.5l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6L3.7 7.8l4.6-1.7L10 1.5z" />
              </svg>
              Profesyonel Hizmette Yeni Nesil Platform
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
                İhtiyacın olan hizmeti
                <br />
                <span className="brand-gradient-text">dakikalar içinde</span> bul
              </h1>
              <p className="mt-5 max-w-xl text-white/70">
                Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, işine
                hemen başla.
              </p>

              <div className="mt-8 w-full max-w-xl">
                <SearchBar size="lg" />
              </div>
            </div>

            <div className="flex flex-col items-center border-t border-white/10 pt-16 text-center lg:items-start lg:border-t-0 lg:border-l lg:pl-16 lg:pt-0 lg:text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Yeteneğini bir hizmete dönüştür
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Ücretsiz kayıt ol, ilk ilanını dakikalar içinde yayınla ve kazanmaya başla.
              </p>

              <LinkButton href="/kayit?role=FREELANCER" className="mt-8">
                Freelancer Ol
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
              Neden <span className="text-purple-600">Profestia</span>?
            </h2>
            <p className="mt-4 text-slate-500">
              Yeteneklerini sergile, fırsatları yakala, geleceğini şekillendir.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3">
            <WhyCard
              icon="user"
              title="Potansiyelini Keşfet"
              description="Yeteneklerini sergile, görünürlüğünü artır. Doğru fırsatlarla buluşarak kariyerini bir üst seviyeye taşı."
            />
            <WhyCard
              icon="users"
              title="İş Birlikleri Kur"
              description="Farklı uzmanlarla tanış, ortak projeler geliştir. Bilgi ve deneyim paylaşımının gücüyle daha büyük işler başar."
            />
            <WhyCard
              icon="growth"
              title="Değer Üret, Kazan"
              description="Yeteneklerinle değer yarat, hak ettiğin kazancı elde et. Kendi koşullarınla, kendi geleceğini inşa et."
            />
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Hemen Katıl
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const whyIconPaths: Record<string, string> = {
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z M5 20a7 7 0 0114 0",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M2.5 20a6.5 6.5 0 0113 0 M17 4.3a3.5 3.5 0 010 6.9 M18 14.2a6.5 6.5 0 013.5 5.8",
  growth: "M4 20h16 M7 20v-6 M12 20V9 M17 20v-9 M14 5h5v5",
};

function WhyCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof whyIconPaths;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={whyIconPaths[icon]} />
        </svg>
      </span>
      <h3 className="mt-6 text-lg font-bold text-brand-navy">{title}</h3>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
