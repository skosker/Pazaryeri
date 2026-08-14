import Image from "next/image";
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

          <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl">
                İhtiyacın olan hizmeti
                <br />
                <span className="brand-gradient-text">dakikalar içinde</span> bul
              </h1>
              <p className="mt-5 max-w-xl text-white/70">
                Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, işine
                hemen başla.
              </p>

              {/* Both columns end in an equal-height, centred row pushed to the bottom by
                  mt-auto, so the search bar and the Freelancer Ol button line up at lg and up. */}
              <div className="mt-8 flex w-full max-w-xl items-center lg:mt-auto lg:h-14">
                <div className="w-full">
                  <SearchBar size="lg" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center border-t border-white/10 pt-16 text-center lg:items-start lg:border-t-0 lg:border-l lg:pl-16 lg:pt-0 lg:text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
                Yeteneğini bir hizmete dönüştür
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Ücretsiz kayıt ol, ilk ilanını hemen yayınla ve kazanmaya başla.
              </p>

              <div className="mt-8 flex items-center lg:mt-auto lg:h-14">
                <LinkButton href="/kayit?role=FREELANCER">Freelancer Ol</LinkButton>
              </div>
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

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <WhyCard
              icon="compass"
              image="/neden-kesfet.png"
              title="Potansiyelini Keşfet"
              description="Yeteneklerini sergile, görünürlüğünü artır. Doğru fırsatlarla buluşarak kariyerini bir üst seviyeye taşı."
            />
            <WhyCard
              icon="users"
              image="/neden-isbirligi.png"
              title="İş Birlikleri Kur"
              description="Farklı uzmanlarla tanış, ortak projeler geliştir. Bilgi ve deneyim paylaşımının gücüyle daha büyük işler başar."
            />
            <WhyCard
              icon="growth"
              image="/neden-deger.png"
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
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18z M15.6 8.4l-2.3 4.9-4.9 2.3 2.3-4.9 4.9-2.3z",
  users:
    "M9.3 11.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z M3.3 19.5a6 6 0 0112 0 M16.2 5.3a3 3 0 010 5.6 M17.6 13.7a5.6 5.6 0 013.4 4.9",
  growth: "M4 20h16 M8 20v-4.5 M12.5 20v-8 M17 20v-11 M13.5 6.5L17 3l3.5 3.5",
};

function WhyCard({
  icon,
  image,
  title,
  description,
}: {
  icon: keyof typeof whyIconPaths;
  image: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* The illustrations have different aspect ratios and a dark vignette at their
          edges, so they are cropped to a common band that keeps the lit centre. */}
      <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-brand-navy">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="scale-110 object-cover object-center"
        />
      </div>

      {/* The badge overlaps the image edge so the icon and illustration read as one unit;
          z-10 keeps it above the positioned image wrapper. */}
      <span className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600 ring-4 ring-white">
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
      <h3 className="mt-4 text-lg font-bold text-brand-navy">{title}</h3>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
