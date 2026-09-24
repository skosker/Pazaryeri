import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { SupportFaq, type FaqGroup } from "./support-faq";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { getOpenCampaigns, type CampaignRow } from "@/lib/campaign";

// Built statically; saving /admin/ayarlar revalidates every page, and this refreshes it at
// least hourly anyway so an answer never quotes an old price for long.
export const revalidate = 3600;

const tl = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;
const pct = (n: number) => `%${n.toLocaleString("tr-TR")}`;

/**
 * Prices, rates and limits come from /admin/ayarlar, so an answer never quotes a figure
 * the site no longer charges; a campaign switched off there drops its questions.
 * Deliberately nothing about the service fee — it is not published.
 */
function buildFaqGroups(settings: SiteSettings, campaigns: CampaignRow[]): FaqGroup[] {
  const groups: FaqGroup[] = [
    {
      id: "siparis-odeme",
      icon: "🛒",
      title: "Sipariş ve Ödeme",
      items: [
        {
          q: "Nasıl sipariş veririm?",
          a: "Kategorilere göz at ya da arama yap, beğendiğin ilana gir, Temel / Standart / Premium paketlerinden birini seç ve ödeme sayfasında ödemeni yap.",
        },
        {
          q: "Hangi ödeme yöntemlerini kullanabilirim?",
          a: "Şu an ödemeleri Havale/EFT ile alıyoruz: ödeme sayfasındaki şirket hesabına havale yapıp “Ödeme Bildirimi Yap”a basman yeterli. Bildirim onaylandığında sipariş başlar.",
        },
        {
          q: "Havale/EFT ile ödedim, siparişim ne zaman başlar?",
          a: "Ödeme bildirimini gönderdikten sonra ekibimiz kontrol edip onaylar. Onaylandığında satıcı siparişi görür ve işe başlar.",
        },
        ...(settings.firstOrderEnabled && settings.firstOrderPercent > 0
          ? [
              {
                q: "İlk siparişimde indirim var mı?",
                a: `Evet. Prosinta'daki ilk siparişine ${pct(settings.firstOrderPercent)} indirim uygulanır (en fazla ${tl(settings.firstOrderMaxTl)}). İndirim ödeme sayfasında otomatik düşer, kod girmene gerek yok; ilan sayfasında da “İlk siparişine özel” notuyla görürsün.`,
              },
            ]
          : []),
        ...(settings.referralEnabled && settings.referralRewardTl > 0
          ? [
              {
                q: "Arkadaşımı davet edersem ne kazanırım?",
                a: `Panel → Davet Et sayfasındaki kişisel bağlantınla kayıt olan arkadaşının ilk siparişi tamamlandığında sana ${tl(settings.referralRewardTl)} davet ödülü tanımlanır. Ödül, bu tutardan yüksek bir sonraki siparişinde ödeme sayfasında otomatik düşer.`,
              },
            ]
          : []),
        ...campaigns.slice(0, 1).map((c) => ({
          q: `${c.name} kampanyası nedir?`,
          a: `Freelancer'ların ilanlarına kendi belirlediği indirimle katıldığı tarihli bir kampanyadır. Katılan ilanlar kampanya süresince indirimli fiyat ve “${c.name}” rozetiyle gösterilir; hepsini Kampanya sayfasında bulabilirsin. Freelancer'san Panel → Kampanyalar'dan ilanlarını katabilirsin.`,
        })),
        {
          q: "Bazı ilanlarda “Şu An Sipariş Almıyor” yazıyor, neden?",
          a: "O satıcı şu an yeni sipariş kabul etmiyor. İlan sayfasının altındaki benzer hizmetlere ya da aynı kategorideki diğer ilanlara göz atabilirsin.",
        },
        {
          q: "Siparişimi iptal edebilir miyim?",
          a: "Ödeme yapmadan önce sipariş sayfasından iptal edebilirsin. Ödeme yaptıysan ve satıcı henüz işe başlamadıysa sipariş sayfasından iptal talebi gönderebilir ya da destek@prosinta.com üzerinden bize ulaşabilirsin.",
        },
        {
          q: "Teslim edilen işi beğenmezsem ne olur?",
          a: "Paketinde belirtilen revizyon hakkını kullanarak satıcından değişiklik isteyebilirsin. Ödeme, sen teslimatı onaylamadan satıcıya aktarılmaz.",
        },
      ],
    },
    {
      id: "mesajlasma",
      icon: "💬",
      title: "Mesajlaşma",
      items: [
        {
          q: "Satıcıyla nasıl iletişime geçerim?",
          a: "İlan sayfasındaki “Satıcıya Mesaj Gönder” ya da freelancer profilindeki “Mesaj Gönder” ile yazabilirsin. Sipariş verdikten sonra sipariş sayfasından da mesajlaşabilirsin. Tüm yazışmaların Panel → Mesajlar'da; yeni mesaj gelince e-posta ile de haber veririz.",
        },
        {
          q: "Mesajımdaki telefon numarası veya e-posta neden gizlendi?",
          a: "Güvenliğin için iletişim ve ödemeler Prosinta üzerinden yürür. Telefon, e-posta, IBAN ve WhatsApp/Telegram/Instagram bağlantıları mesajlarda otomatik olarak “[iletişim bilgisi gizlendi]” ile değiştirilir. Böylece ödemen Prosinta güvencesinde kalır.",
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
          a: "Kayıt olurken “Hizmet Sağlayacağım (Freelancer)” seçeneğini seç. Alıcı hesabın varsa Panel → “Freelancer Ol” sayfasından profilini (unvan ve biyografi) tamamlaman yeterli.",
        },
        ...(settings.founderEnabled
          ? [
              {
                q: "Kurucu Freelancer nedir?",
                a: `Prosinta'nın ilk ${settings.founderLimit.toLocaleString("tr-TR")} freelancer'ına verilen kalıcı bir rozettir. İlk ilanın onaylandığında kontenjan varsa otomatik olarak Kurucu Freelancer olursun: rozet profilinde ve ilanlarında görünür, ilanların aramalarda öne çıkar.`,
              },
            ]
          : []),
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
          a: "Alıcı siparişi onayladıktan sonra hakedişin işleme alınır; IBAN'ına aktarım ekibimiz tarafından yapılır. Tutarları Panel → Ödeme Bilgileri'nde görebilirsin.",
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
          q: "Şirket (kurumsal) olarak kayıt olabilir miyim?",
          a: "Evet. Kayıtta “Hizmet Satın Alacağım”ı seçip “Kurumsal”a geç; şirket unvanı, vergi dairesi, vergi numarası ve fatura adresini gir. Mevcut hesabın için Panel → Profilim → Fatura Bilgileri'nden de ekleyebilirsin. Faturaların şirket unvanına düzenlenir.",
        },
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
          a: `Panel → İlanlarım sayfasından “Yeni İlan Oluştur”a tıklayıp başlık, açıklama, kapak görseli, en fazla ${settings.portfolioImages} örnek iş görseli ve üç paketini (Temel/Standart/Premium) belirleyebilirsin.`,
        },
        {
          q: "İlanımı sonradan düzenleyebilir miyim?",
          a: "Evet, İlanlarım sayfasından istediğin zaman fiyat, açıklama ve paket detaylarını güncelleyebilirsin.",
        },
        {
          q: "İlanım neden yayında görünmüyor?",
          a: "Yeni ilanlar ekibimizin onayından sonra yayına alınır; İlanlarım'da durumu “Onay Bekliyor” olarak görürsün. İlanını kendin duraklattıysan “Yayına Al” ile tekrar açabilirsin.",
        },
        ...(settings.boostEnabled
          ? [
              {
                q: "İlanımı nasıl öne çıkarırım?",
                a: `İlanlarım sayfasında yayındaki ilanının yanındaki “Öne Çıkar” butonuyla, ${tl(settings.boostPriceTl)} karşılığında ilanını ${settings.boostDays} gün boyunca kategori ve arama sonuçlarında en üstte gösterebilirsin. Süre bitmeden tekrar alırsan kalan sürenin üzerine eklenir.`,
              },
              {
                q: "İlanlardaki “Sponsorlu” etiketi ne demek?",
                a: "Satıcısı tarafından ücret karşılığı öne çıkarılmış ilanları gösterir. Sponsorlu ilanlar da diğer tüm ilanlar gibi Prosinta güvencesiyle satın alınır.",
              },
            ]
          : []),
      ],
    },
    {
      id: "pro-uyelik",
      icon: "⭐",
      title: "Pro Üyelik",
      items: [
        {
          q: "Pro ve Pro Plus üyelik nedir?",
          a: `Freelancer'lara özel üyelik paketleri. Pro (aylık ${tl(settings.proMonthlyTl)}): ilanların aramalarda Pro olmayanların önüne geçer, ilanlarında ve profilinde Pro rozeti görünür, ilan başına ${settings.portfolioImagesPro} örnek iş görseli ekleyebilirsin${settings.proFreeBoostDays > 0 ? ` ve her ay ${settings.proFreeBoostDays} gün ücretsiz Öne Çıkar hakkın olur` : ""}. Pro Plus (aylık ${tl(settings.plusMonthlyTl)}): Pro'daki her şeye ek olarak aramalarda Pro üyelerin de önüne geçersin, Freelancer Bul listesinde en üstte görünürsün${settings.plusFreeBoostDays > 0 ? `, her ay ${settings.plusFreeBoostDays} gün ücretsiz Öne Çıkar hakkın olur` : ""}${settings.plusBoostDiscountPercent > 0 ? ` ve Öne Çıkar'ı ${pct(settings.plusBoostDiscountPercent)} indirimle alırsın` : ""}.`,
        },
        {
          q: "Aylık ve yıllık ödeme arasındaki fark nedir?",
          a: `Yıllık planda 12 ayı tek seferde ödersin ve aylık fiyata göre ${pct(settings.yearlyDiscountPercent)} tasarruf edersin. Üyelikler otomatik yenilenmez: süren bitmeden bir hafta önce e-postayla hatırlatırız, yenilemezsen ücretsiz pakete dönersin ve ilanların yayında kalır.`,
        },
        ...(settings.proTrialEnabled
          ? [
              {
                q: "Pro'yu ücretsiz deneyebilir miyim?",
                a: `Evet. Daha önce üye olmadıysan Pro'yu ${settings.proTrialDays} gün ücretsiz deneyebilirsin; kart ya da ödeme bilgisi istenmez. Deneme bitince otomatik ücret alınmaz.`,
              },
            ]
          : []),
        {
          q: "Paketimi değiştirebilir miyim?",
          a: "Evet, istediğin zaman. Yeni paketi aldığında mevcut üyeliğinin kalan süresi kaybolmaz; iki paketin fiyat oranına göre yeni paketinin süresine çevrilip eklenir. Aynı paketi yeniden alırsan süren mevcut bitiş tarihinin üzerine eklenir.",
        },
        {
          q: "Üyeliğe nasıl geçerim?",
          a: "Panel → Pro Üyelik sayfasından (ya da Üyelik Paketleri sayfasından) paketini ve dönemini seçip ödemeni yap. Havale/EFT ile ödediysen ekibimiz onayladığında üyeliğin açılır.",
        },
        {
          q: "Alıcılar Pro üye olabilir mi?",
          a: "Üyelik paketleri freelancer'lar içindir. Alıcılar “Sadece Pro freelancer'ları göster” filtresini ücretsiz kullanabilir.",
        },
      ],
    },
  ];
  return groups;
}

export default async function SupportPage() {
  const faqGroups = buildFaqGroups(await getSettings(), await getOpenCampaigns());
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
