import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { SupportFaq, type FaqGroup } from "./support-faq";

const faqGroups: FaqGroup[] = [
  {
    id: "siparis-odeme",
    icon: "🛒",
    title: "Sipariş ve Ödeme",
    items: [
      {
        q: "Nasıl sipariş veririm?",
        a: "Kategorilere göz at ya da arama yap, beğendiğin ilana gir, Başlangıç / Standart / Premium paketlerinden birini seç ve ödeme sayfasında Kart veya Havale/EFT ile öde.",
      },
      {
        q: "Hangi ödeme yöntemlerini kullanabilirim?",
        a: "Kart ile iyzico üzerinden anında ödeyebilir, ya da Havale/EFT yapıp bildirimini iletebilirsin — bildirim onaylandığında sipariş başlar.",
      },
      {
        q: "Havale/EFT ile ödedim, siparişim ne zaman başlar?",
        a: "Ödeme bildirimini gönderdikten sonra ekibimiz kontrol edip onaylar. Onaylandığında satıcı siparişi görür ve işe başlar.",
      },
      {
        q: "Siparişimi iptal edebilir miyim?",
        a: "Satıcı henüz işe başlamadıysa satıcıyla iletişime geçerek ya da destek@prosinta.com üzerinden bize ulaşarak iptal talebinde bulunabilirsin.",
      },
      {
        q: "Teslim edilen işi beğenmezsem ne olur?",
        a: "Paketinde belirtilen revizyon hakkını kullanarak satıcından değişiklik isteyebilirsin. Ödeme, sen teslimatı onaylamadan satıcıya aktarılmaz.",
      },
    ],
  },
  {
    id: "freelancer-olmak",
    icon: "🙋",
    title: "Freelancer Olmak",
    items: [
      {
        q: "Freelancer olmak ücretli mi?",
        a: "Hayır. Kayıt olmak ve ilan yayınlamak tamamen ücretsiz.",
      },
      {
        q: "Nasıl freelancer olurum?",
        a: "Panelinden “Freelancer Ol” seçeneğine tıklayıp profilini (uzmanlık alanların, şehir, biyografi) tamamlaman yeterli.",
      },
      {
        q: "Kaç ilan yayınlayabilirim?",
        a: "Bir sınır yok — istediğin kadar kategori ve alanda ilan açabilirsin.",
      },
    ],
  },
  {
    id: "hakedis",
    icon: "💰",
    title: "Hakediş ve Ödemeler",
    items: [
      {
        q: "Kazandığım parayı nasıl alırım?",
        a: "Panelinden IBAN bilgini kaydettiğinde, tamamlanan siparişlerin hakedişi bu hesaba aktarılır.",
      },
      {
        q: "Hakedişim ne zaman hesabıma geçer?",
        a: "Alıcı siparişi onayladıktan sonra hakedişin işleme alınır; IBAN'ına aktarım ekibimiz tarafından yapılır.",
      },
      {
        q: "IBAN bilgimi nereden güncellerim?",
        a: "Panel → Ödeme Bilgileri sayfasından IBAN ve hesap sahibi bilgini istediğin zaman güncelleyebilirsin.",
      },
    ],
  },
  {
    id: "hesap-guvenlik",
    icon: "🔒",
    title: "Hesap ve Güvenlik",
    items: [
      {
        q: "Şifremi unuttum, ne yapmalıyım?",
        a: "Giriş sayfasındaki “Şifremi Unuttum” linkine tıkla; e-posta adresine gelen bağlantıyla yeni bir şifre belirleyebilirsin.",
      },
      {
        q: "Hesabımı nasıl doğrularım?",
        a: "Kayıt olduktan sonra e-posta adresine gelen doğrulama linkine tıklaman yeterli.",
      },
      {
        q: "Hesabım neden askıya alındı?",
        a: "Kullanım şartlarına aykırı bir durum tespit edildiğinde hesaplar geçici olarak askıya alınabilir. Detay için destek@prosinta.com üzerinden bize ulaşabilirsin.",
      },
    ],
  },
  {
    id: "ilan-olusturma",
    icon: "📝",
    title: "İlan Oluşturma",
    items: [
      {
        q: "Yeni ilan nasıl oluştururum?",
        a: "Panel → İlanlarım sayfasından “Yeni İlan Oluştur”a tıklayıp başlık, açıklama, kapak görseli ve üç paketini (Başlangıç/Standart/Premium) belirleyebilirsin.",
      },
      {
        q: "İlanımı sonradan düzenleyebilir miyim?",
        a: "Evet, İlanlarım sayfasından istediğin zaman fiyat, açıklama ve paket detaylarını güncelleyebilirsin.",
      },
      {
        q: "İlanım neden yayında görünmüyor?",
        a: "Kapak görseli ya da paket bilgisi eksikse ilan yayınlanmaz — tüm alanları doldurduğundan emin ol.",
      },
    ],
  },
  {
    id: "pro-uyelik",
    icon: "⭐",
    title: "Pro Üyelik",
    items: [
      {
        q: "Pro üyelik nedir?",
        a: "Hem alıcılar hem freelancer'lar için sunulan ayrıcalıklı üyelik: freelancer'da öne çıkma, alıcıda ayrıcalıklı filtreler sağlar.",
      },
      {
        q: "Pro üyeliğe nasıl geçerim?",
        a: "Panelinden “Pro Ol” sayfasından başvurabilirsin.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">
            Size nasıl yardımcı olabiliriz?
          </h1>
          <p className="mt-4 text-slate-500">
            Sipariş, ödeme, hakediş ve hesabınla ilgili en çok sorulan soruların yanıtları burada.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <SupportFaq groups={faqGroups} />

        <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-brand-navy">Aradığın yanıtı bulamadın mı?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Ekibimiz e-posta üzerinden yardımcı olmaktan mutluluk duyar.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="mailto:destek@prosinta.com">Bize Yaz</LinkButton>
            <Link
              href="/nasil-calisir"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-slate-50"
            >
              Nasıl Çalışır?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
