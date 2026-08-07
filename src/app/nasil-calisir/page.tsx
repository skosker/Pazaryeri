import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

const buyerSteps = [
  {
    title: "Hizmeti bul",
    description: "Kategorilere göz at ya da aradığın hizmeti ara, filtrelerle en uygun ilanı bul.",
  },
  {
    title: "Paketi seç ve öde",
    description: "Fiyat, teslim süresi ve revizyon hakkını incele. Profestia güvencesiyle ödemeni yap.",
  },
  {
    title: "Satıcı işe başlar",
    description: "Ödemen Profestia'da güvenle bekletilir, satıcı onaylayıp işe başlar.",
  },
  {
    title: "Teslim al ve onayla",
    description: "İş teslim edildiğinde inceler, onaylarsın. Onayınla ödeme satıcıya aktarılır.",
  },
];

const sellerSteps = [
  {
    title: "Freelancer olarak kayıt ol",
    description: "Ücretsiz hesap oluştur, profilini tamamla.",
  },
  {
    title: "İlanını yayınla",
    description: "Hizmetini, fiyatını ve teslim süreni belirleyerek ilk ilanını oluştur.",
  },
  {
    title: "Sipariş al",
    description: "Alıcı ödemeyi yapınca bildirim alır, siparişi onaylayıp işe başlarsın.",
  },
  {
    title: "Teslim et, ödemeni al",
    description: "İşi teslim et, alıcı onayladığında ödeme hesabına aktarılır.",
  },
];

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
            {i + 1}
          </span>
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
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            Alıcılar için
          </span>
          <h2 className="mt-3 text-xl font-bold text-brand-navy">Hizmet almak</h2>
          <div className="mt-6">
            <StepList steps={buyerSteps} />
          </div>
          <LinkButton href="/kategoriler" className="mt-8">
            Hizmetlere Göz At
          </LinkButton>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Freelancer&apos;lar için
          </span>
          <h2 className="mt-3 text-xl font-bold text-brand-navy">Hizmet vermek</h2>
          <div className="mt-6">
            <StepList steps={sellerSteps} />
          </div>
          <LinkButton href="/kayit?role=FREELANCER" variant="outline" className="mt-8">
            Freelancer Ol
          </LinkButton>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy">Merak edilenler</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
            <Faq
              q="Ödemem güvende mi?"
              a="Evet. Ödemen Profestia güvencesiyle korunur ve iş teslim alınıp onaylanana kadar satıcıya aktarılmaz."
            />
            <Faq
              q="İşten memnun kalmazsam ne olur?"
              a="Teslimatı onaylamadan önce paketinde belirtilen revizyon hakkını kullanarak değişiklik isteyebilirsin."
            />
            <Faq
              q="Freelancer olmak ücretli mi?"
              a="Hayır, kayıt olmak ve ilan yayınlamak tamamen ücretsizdir."
            />
            <Faq
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

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <p className="font-semibold text-brand-navy">{q}</p>
      <p className="mt-2 text-sm text-slate-500">{a}</p>
    </div>
  );
}
