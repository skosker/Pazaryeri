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
          <h1 className="mt-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
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

