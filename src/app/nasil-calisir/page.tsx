import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { StepIcon } from "./step-icon";

const buyerSteps = [
  {
    icon: "search",
    title: "Hizmeti bul",
    description: "Kategorilere göz at ya da aradığın hizmeti ara, filtrelerle en uygun ilanı bul.",
  },
  {
    icon: "credit-card",
    title: "Paketi seç ve öde",
    description: "Fiyat, teslim süresi ve revizyon hakkını incele. Profestia güvencesiyle ödemeni yap.",
  },
  {
    icon: "clock",
    title: "Satıcı işe başlar",
    description: "Ödemen Profestia'da güvenle bekletilir, satıcı onaylayıp işe başlar.",
  },
  {
    icon: "check-circle",
    title: "Teslim al ve onayla",
    description: "İş teslim edildiğinde inceler, onaylarsın. Onayınla ödeme satıcıya aktarılır.",
  },
];

const sellerSteps = [
  {
    icon: "user-plus",
    title: "Freelancer olarak kayıt ol",
    description: "Ücretsiz hesap oluştur, profilini tamamla.",
  },
  {
    icon: "megaphone",
    title: "İlanını yayınla",
    description: "Hizmetini, fiyatını ve teslim süreni belirleyerek ilk ilanını oluştur.",
  },
  {
    icon: "bell",
    title: "Sipariş al",
    description: "Alıcı ödemeyi yapınca bildirim alır, siparişi onaylayıp işe başlarsın.",
  },
  {
    icon: "banknote",
    title: "Teslim et, ödemeni al",
    description: "İşi teslim et, alıcı onayladığında ödeme hesabına aktarılır.",
  },
];

function StepList({
  steps,
  accent,
}: {
  steps: { icon: string; title: string; description: string }[];
  accent: "purple" | "indigo";
}) {
  const badgeColor = accent === "purple" ? "bg-purple-50 text-purple-700" : "bg-indigo-50 text-indigo-700";

  return (
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <div className="relative shrink-0">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${badgeColor}`}>
              <StepIcon name={step.icon} className="text-2xl" />
            </span>
            <span className="brand-gradient absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white">
              {i + 1}
            </span>
          </div>
          <div>
            <p className="font-semibold text-brand-navy">{step.title}</p>
            <p className="mt-1 text-sm text-slate-500">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">Nasıl Çalışır?</h1>
          <p className="mt-4 text-slate-500">
            Profestia&apos;da hizmet almak ya da freelancer olarak çalışmaya başlamak dakikalar sürer.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <TrustBadge icon="shield-check" label="Güvenli ödeme" />
            <TrustBadge icon="refresh" label="Revizyon hakkı" />
            <TrustBadge icon="clock" label="Net teslim süresi" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Both cards are columns whose step list grows, so the two buttons line up
            even though the columns hold different amounts of text. */}
        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8">
          <span className="w-fit rounded-full bg-purple-50 px-3.5 py-1.5 text-sm font-semibold text-purple-700">
            Alıcılar için
          </span>
          <h2 className="mt-3 text-xl font-bold text-brand-navy">Hizmet almak</h2>
          <div className="mt-6 flex-1">
            <StepList steps={buyerSteps} accent="purple" />
          </div>
          <LinkButton href="/kategoriler" variant="outline" className="mt-8 self-start">
            Hizmetlere Göz At
          </LinkButton>
        </div>

        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8">
          <span className="w-fit rounded-full bg-indigo-50 px-3.5 py-1.5 text-sm font-semibold text-indigo-700">
            Freelancer&apos;lar için
          </span>
          <h2 className="mt-3 text-xl font-bold text-brand-navy">Hizmet vermek</h2>
          <div className="mt-6 flex-1">
            <StepList steps={sellerSteps} accent="indigo" />
          </div>
          <LinkButton href="/kayit?role=FREELANCER" variant="outline" className="mt-8 self-start">
            Freelancer Ol
          </LinkButton>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy">Merak edilenler</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
            <Faq
              icon="shield-check"
              q="Ödemem güvende mi?"
              a="Evet. Ödemen Profestia güvencesiyle korunur ve iş teslim alınıp onaylanana kadar satıcıya aktarılmaz."
            />
            <Faq
              icon="refresh"
              q="İşten memnun kalmazsam ne olur?"
              a="Teslimatı onaylamadan önce paketinde belirtilen revizyon hakkını kullanarak değişiklik isteyebilirsin."
            />
            <Faq
              icon="gift"
              q="Freelancer olmak ücretli mi?"
              a="Hayır, kayıt olmak ve ilan yayınlamak tamamen ücretsizdir."
            />
            <Faq
              icon="clock"
              q="Ne kadar sürede teslim alırım?"
              a="Her ilanda satıcının belirlediği teslim süresi net olarak yazar, sipariş vermeden önce görebilirsin."
            />
          </div>
          <p className="mt-10 text-sm text-slate-500">
            Başka sorun mu var?{" "}
            <Link href="/" className="font-semibold text-purple-700 hover:underline">
              Ana sayfaya dön
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Faq({ icon, q, a }: { icon: string; q: string; a: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
        <StepIcon name={icon} className="text-xl" />
      </span>
      <div>
        <p className="font-semibold text-brand-navy">{q}</p>
        <p className="mt-2 text-sm text-slate-500">{a}</p>
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-brand-navy shadow-sm">
      <StepIcon name={icon} className="text-base" />
      {label}
    </span>
  );
}
