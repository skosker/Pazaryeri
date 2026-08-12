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

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/50 bg-gradient-to-r from-fuchsia-500/25 via-purple-500/25 to-indigo-500/25 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-fuchsia-500/20">
            <svg className="h-3.5 w-3.5 text-fuchsia-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 1.5l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6L3.7 7.8l4.6-1.7L10 1.5z" />
            </svg>
            Profesyonel Hizmette Yeni Nesil Platform
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
            İhtiyacın olan hizmeti
            <br />
            <span className="brand-gradient-text">dakikalar içinde</span> bul
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Grafik tasarımdan yazılıma, binlerce yetenekli freelancer arasından seç, işine
            hemen başla.
          </p>

          <div className="mx-auto mt-8 w-full max-w-xl">
            <SearchBar size="lg" />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <Feature
            icon="shield"
            accent="emerald"
            title="Profestia güvencesiyle ödeme"
            description="İş onaylanmadan ödeme satıcıya aktarılmaz."
          />
          <Feature
            icon="check"
            accent="sky"
            title="Doğrulanmış freelancer'lar"
            description="Değerlendirmeler ve tamamlanan iş geçmişiyle güvenle seç."
          />
          <Feature
            icon="headset"
            accent="fuchsia"
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
              description="Ödemeni yap, iş onaylanana kadar Profestia güvencesinde tutulur."
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

          <ul className="mt-8 flex flex-col gap-3 text-left sm:flex-row sm:gap-8">
            <FreelancerBenefit text="Ücretsiz kayıt, gizli komisyon yok" />
            <FreelancerBenefit text="Fiyatını ve teslim sürini sen belirle" />
            <FreelancerBenefit text="Ödemen onay sonrası hesabına geçer" />
          </ul>

          <LinkButton href="/kayit?role=FREELANCER" className="mt-8">
            Freelancer Ol
          </LinkButton>
        </div>
      </section>
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

function FreelancerBenefit({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-white/80">
      <svg
        className="h-4.5 w-4.5 shrink-0 text-emerald-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      {text}
    </li>
  );
}

const featureIconPaths: Record<string, string> = {
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4",
  check: "M12 21a9 9 0 100-18 9 9 0 000 18z M8.5 12l2.5 2.5 4.5-4.5",
  headset:
    "M4 13v-1a8 8 0 0116 0v1 M3 13a2 2 0 012-2h1v6H5a2 2 0 01-2-2v-2z M19 13a2 2 0 00-2-2h-1v6h1a2 2 0 002-2v-2z",
};

const featureAccents: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  sky: { bg: "bg-sky-50", text: "text-sky-600" },
  fuchsia: { bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
};

function Feature({
  icon,
  accent,
  title,
  description,
}: {
  icon: keyof typeof featureIconPaths;
  accent: keyof typeof featureAccents;
  title: string;
  description: string;
}) {
  const { bg, text } = featureAccents[accent];
  return (
    <div className="rounded-2xl border border-slate-100 p-6 transition hover:shadow-lg hover:shadow-slate-100">
      <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${text}`}>
        <svg
          className="h-5.5 w-5.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={featureIconPaths[icon]} />
        </svg>
      </span>
      <h3 className="font-semibold text-brand-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
