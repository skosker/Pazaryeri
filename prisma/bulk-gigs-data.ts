export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

type CategoryContent = {
  slug: string;
  sellerTitle: string;
  verbs: string[];
  extraVerbs: string[];
  subjects: string[];
  // subcategory name for each subject, in the same order as `subjects`
  subcategories: string[];
  // Some subjects do not accept every verb in the category: a voice recording is not
  // composed, a report is not "set up". Those subjects get their own verb lists here,
  // keyed by the subject text, and fall back to the category verbs when absent.
  verbOverrides?: Record<string, { verbs: string[]; extraVerbs: string[] }>;
  priceMin: number;
  priceMax: number;
  deliveryMin: number;
  deliveryMax: number;
  coverColors: string[];
};

const categoryContents: CategoryContent[] = [
  {
    slug: "grafik-tasarim",
    sellerTitle: "Grafik Tasarımcı",
    verbs: ["tasarlıyorum", "hazırlıyorum", "oluşturuyorum", "çiziyorum"],
    extraVerbs: ["yeniden tasarlıyorum", "özenle hazırlıyorum", "profesyonelce oluşturuyorum", "sıfırdan çiziyorum"],
    subjects: [
      "Minimalist logonuzu",
      "Kurumsal kimlik paketinizi",
      "Sosyal medya kapak görselinizi",
      "Ambalajınızı",
      "Broşür ve kataloğunuzu",
      "İnfografiğinizi",
      "Instagram post şablonunuzu",
      "Kartvizitinizi",
      "El ilanınızı (flyer)",
      "Sunumunuzu (PowerPoint)",
      "İkon setinizi",
      "Banner ve afişinizi",
    ],
    subcategories: [
      "Logo Tasarımı",
      "Kurumsal Kimlik",
      "Sosyal Medya Tasarımları",
      "Baskı & Ambalaj Tasarımı",
      "Baskı & Ambalaj Tasarımı",
      "İkon & İllüstrasyon",
      "Sosyal Medya Tasarımları",
      "Baskı & Ambalaj Tasarımı",
      "Baskı & Ambalaj Tasarımı",
      "Sunum Tasarımı",
      "İkon & İllüstrasyon",
      "Baskı & Ambalaj Tasarımı",
    ],
    priceMin: 1200,
    priceMax: 6000,
    deliveryMin: 1,
    deliveryMax: 5,
    coverColors: ["amber", "rose", "violet"],
  },
  {
    slug: "yazilim-web",
    sellerTitle: "Yazılım Geliştirici",
    verbs: ["geliştiriyorum", "kuruyorum", "entegre ediyorum", "optimize ediyorum"],
    extraVerbs: ["yeniliyorum", "sıfırdan kuruyorum", "hatasız geliştiriyorum", "sorunsuz entegre ediyorum"],
    subjects: [
      "WordPress web sitenizi",
      "E-ticaret mağazanızı",
      "Mobil uygulamanızı",
      "Landing page'inizi",
      "API entegrasyonunuzu",
      "Yönetim panelinizi",
      "Chrome eklentinizi",
      "Veritabanı yapınızı",
      "Ödeme altyapınızı",
      "SEO teknik yapınızı",
      "Web sitenizin hız performansını",
      "Özel yazılım projenizi",
    ],
    subcategories: [
      "Web Sitesi Geliştirme",
      "E-ticaret Geliştirme",
      "Mobil Uygulama Geliştirme",
      "Web Sitesi Geliştirme",
      "API & Entegrasyon",
      "Özel Yazılım & Panel",
      "Web Sitesi Geliştirme",
      "API & Entegrasyon",
      "E-ticaret Geliştirme",
      "Teknik SEO & Performans",
      "Teknik SEO & Performans",
      "Özel Yazılım & Panel",
    ],
    verbOverrides: {
      "Web sitenizin hız performansını": { verbs: ["iyileştiriyorum", "optimize ediyorum", "artırıyorum", "ölçüyorum"], extraVerbs: ["belirgin şekilde iyileştiriyorum", "baştan sona optimize ediyorum", "gözle görülür artırıyorum", "detaylıca ölçüyorum"] },
    },
    priceMin: 3500,
    priceMax: 22000,
    deliveryMin: 3,
    deliveryMax: 14,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "yazi-ceviri",
    sellerTitle: "İçerik Yazarı",
    verbs: ["yazıyorum", "hazırlıyorum", "düzenliyorum", "çeviriyorum"],
    extraVerbs: ["özenle yazıyorum", "yeniden düzenliyorum", "akıcı hale getiriyorum", "profesyonelce çeviriyorum"],
    subjects: [
      "Blog yazınızı",
      "Ürün açıklama metinlerinizi",
      "SEO uyumlu makalenizi",
      "E-kitabınızı",
      "İngilizce-Türkçe belgenizi",
      "CV ve ön yazınızı",
      "Web sitesi metinlerinizi",
      "Basın bülteninizi",
      "Sosyal medya metinlerinizi",
      "Sunum metninizi",
      "Akademik metninizi",
      "Senaryo veya diyalog metninizi",
    ],
    subcategories: [
      "İçerik & Blog Yazarlığı",
      "Ürün & Web Metni",
      "İçerik & Blog Yazarlığı",
      "Çeviri Hizmetleri",
      "Çeviri Hizmetleri",
      "Kariyer Metinleri",
      "Ürün & Web Metni",
      "Kurumsal & Akademik Metin",
      "Sosyal Medya & Senaryo",
      "Kurumsal & Akademik Metin",
      "Kurumsal & Akademik Metin",
      "Sosyal Medya & Senaryo",
    ],
    verbOverrides: {
      "İngilizce-Türkçe belgenizi": { verbs: ["çeviriyorum", "düzenliyorum", "redakte ediyorum", "akıcı hale getiriyorum"], extraVerbs: ["profesyonelce çeviriyorum", "yeniden düzenliyorum", "titizlikle redakte ediyorum", "doğal bir dille akıcı hale getiriyorum"] },
    },
    priceMin: 500,
    priceMax: 3500,
    deliveryMin: 1,
    deliveryMax: 4,
    coverColors: ["violet", "amber"],
  },
  {
    slug: "video-animasyon",
    sellerTitle: "Video Editörü",
    verbs: ["kurguluyorum", "hazırlıyorum", "canlandırıyorum", "düzenliyorum"],
    extraVerbs: ["yeniden kurguluyorum", "özenle hazırlıyorum", "akıcı hale getiriyorum", "profesyonelce düzenliyorum"],
    subjects: [
      "Youtube videonuzu",
      "Reels ve TikTok içeriğinizi",
      "Kurumsal tanıtım filminizi",
      "Logo animasyonunuzu",
      "Ürün tanıtım videonuzu",
      "Düğün videonuzu",
      "Podcast videonuzu",
      "Eğitim videonuzu",
      "Reklam filminizi",
      "Motion graphic içeriğinizi",
      "Whiteboard animasyonunuzu",
      "Etkinlik videonuzu",
    ],
    subcategories: [
      "Sosyal Medya Video Kurgu",
      "Sosyal Medya Video Kurgu",
      "Kurumsal & Reklam Filmi",
      "Logo & Motion Animasyon",
      "Ürün & Tanıtım Videosu",
      "Etkinlik & Düğün Videosu",
      "Eğitim & Podcast Videosu",
      "Eğitim & Podcast Videosu",
      "Kurumsal & Reklam Filmi",
      "Logo & Motion Animasyon",
      "Logo & Motion Animasyon",
      "Etkinlik & Düğün Videosu",
    ],
    priceMin: 1500,
    priceMax: 9000,
    deliveryMin: 2,
    deliveryMax: 7,
    coverColors: ["emerald", "rose"],
  },
  {
    slug: "dijital-pazarlama",
    sellerTitle: "Dijital Pazarlama Uzmanı",
    verbs: ["yönetiyorum", "kuruyorum", "optimize ediyorum", "planlıyorum"],
    extraVerbs: ["etkili yönetiyorum", "sıfırdan kuruyorum", "sürekli optimize ediyorum", "detaylıca planlıyorum"],
    subjects: [
      "Google Ads kampanyanızı",
      "Meta (Facebook/Instagram) reklamlarınızı",
      "SEO stratejinizi",
      "E-posta pazarlama akışınızı",
      "Sosyal medya hesaplarınızı",
      "İçerik pazarlama takviminizi",
      "TikTok reklam kampanyanızı",
      "Influencer iş birliklerinizi",
      "Marka konumlandırma stratejinizi",
      "Google My Business profilinizi",
      "Dönüşüm oranı optimizasyonunuzu",
      "E-ticaret pazarlama huninizi",
    ],
    subcategories: [
      "Arama Motoru Reklamcılığı (SEM)",
      "Sosyal Medya Reklamcılığı",
      "SEO & İçerik Pazarlama",
      "E-posta & Dönüşüm Pazarlama",
      "Sosyal Medya Yönetimi",
      "SEO & İçerik Pazarlama",
      "Sosyal Medya Reklamcılığı",
      "Sosyal Medya Yönetimi",
      "Marka Stratejisi",
      "Arama Motoru Reklamcılığı (SEM)",
      "E-posta & Dönüşüm Pazarlama",
      "E-posta & Dönüşüm Pazarlama",
    ],
    verbOverrides: {
      "Dönüşüm oranı optimizasyonunuzu": { verbs: ["yürütüyorum", "planlıyorum", "yönetiyorum", "test ediyorum"], extraVerbs: ["baştan sona yürütüyorum", "detaylıca planlıyorum", "etkili yönetiyorum", "sistemli test ediyorum"] },
    },
    priceMin: 2500,
    priceMax: 14000,
    deliveryMin: 3,
    deliveryMax: 10,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "muzik-ses",
    sellerTitle: "Ses Mühendisi",
    verbs: ["kaydediyorum", "düzenliyorum", "besteliyorum", "miksliyorum"],
    extraVerbs: ["profesyonelce kaydediyorum", "yeniden düzenliyorum", "özenle besteliyorum", "temiz şekilde miksliyorum"],
    subjects: [
      "Podcast bölümünüzü",
      "Reklam filminiz için jingle'ı",
      "Seslendirme kaydınızı",
      "Şarkı düzenlemenizi",
      "Ses efektlerinizi",
      "Youtube kanalınızın müziklerini",
      "Sunum videonuzun fon müziğini",
      "Telesekreter mesajınızı",
      "Radyo spotunuzu",
      "Oyun müziklerinizi",
      "Enstrümantal beat'inizi",
      "Ses kayıt post prodüksiyonunuzu",
    ],
    subcategories: [
      "Podcast Prodüksiyonu",
      "Reklam & Jingle",
      "Seslendirme",
      "Müzik Besteleme & Beat",
      "Ses Efektleri & Mix",
      "Video & Sunum Müziği",
      "Video & Sunum Müziği",
      "Seslendirme",
      "Reklam & Jingle",
      "Müzik Besteleme & Beat",
      "Müzik Besteleme & Beat",
      "Podcast Prodüksiyonu",
    ],
    verbOverrides: {
      "Podcast bölümünüzü": { verbs: ["kaydediyorum", "düzenliyorum", "miksliyorum", "temizliyorum"], extraVerbs: ["profesyonelce kaydediyorum", "yeniden düzenliyorum", "temiz şekilde miksliyorum", "baştan sona temizliyorum"] },
      "Seslendirme kaydınızı": { verbs: ["yapıyorum", "düzenliyorum", "miksliyorum", "temizliyorum"], extraVerbs: ["profesyonelce yapıyorum", "yeniden düzenliyorum", "temiz şekilde miksliyorum", "baştan sona temizliyorum"] },
      "Ses efektlerinizi": { verbs: ["hazırlıyorum", "düzenliyorum", "miksliyorum", "tasarlıyorum"], extraVerbs: ["özenle hazırlıyorum", "yeniden düzenliyorum", "temiz şekilde miksliyorum", "sıfırdan tasarlıyorum"] },
      "Telesekreter mesajınızı": { verbs: ["kaydediyorum", "seslendiriyorum", "düzenliyorum", "miksliyorum"], extraVerbs: ["profesyonelce kaydediyorum", "profesyonelce seslendiriyorum", "yeniden düzenliyorum", "temiz şekilde miksliyorum"] },
      "Radyo spotunuzu": { verbs: ["hazırlıyorum", "seslendiriyorum", "kurguluyorum", "miksliyorum"], extraVerbs: ["özenle hazırlıyorum", "profesyonelce seslendiriyorum", "yeniden kurguluyorum", "temiz şekilde miksliyorum"] },
      "Ses kayıt post prodüksiyonunuzu": { verbs: ["yapıyorum", "üstleniyorum", "tamamlıyorum", "yönetiyorum"], extraVerbs: ["profesyonelce yapıyorum", "baştan sona üstleniyorum", "eksiksiz tamamlıyorum", "titizlikle yönetiyorum"] },
      "Şarkı düzenlemenizi": { verbs: ["yapıyorum", "hazırlıyorum", "miksliyorum", "tamamlıyorum"], extraVerbs: ["profesyonelce yapıyorum", "özenle hazırlıyorum", "temiz şekilde miksliyorum", "eksiksiz tamamlıyorum"] },
    },
    priceMin: 800,
    priceMax: 5000,
    deliveryMin: 1,
    deliveryMax: 5,
    coverColors: ["indigo", "rose"],
  },
  {
    slug: "is-danismanlik",
    sellerTitle: "İş Danışmanı",
    verbs: ["kuruyorum", "hazırlıyorum", "yönetiyorum", "planlıyorum"],
    extraVerbs: ["sıfırdan kuruyorum", "özenle hazırlıyorum", "etkili yönetiyorum", "detaylıca planlıyorum"],
    subjects: [
      "İş planınızı",
      "Finansal projeksiyonlarınızı",
      "Pazarlama stratejinizi",
      "İnsan kaynakları süreçlerinizi",
      "Startup danışmanlığınızı",
      "Yatırımcı sunumunuzu (pitch deck)",
      "Süreç iyileştirme çalışmanızı",
      "Marka stratejinizi",
      "Satış huninizi",
      "Proje yönetim sürecinizi",
      "E-ticaret operasyonunuzu",
      "Kurumsal eğitim programınızı",
    ],
    subcategories: [
      "İş Planı & Finansal Danışmanlık",
      "İş Planı & Finansal Danışmanlık",
      "Pazarlama & Marka Danışmanlığı",
      "İK & Kurumsal Eğitim",
      "Startup & Yatırımcı Danışmanlığı",
      "Startup & Yatırımcı Danışmanlığı",
      "Süreç & Proje Yönetimi",
      "Pazarlama & Marka Danışmanlığı",
      "Satış & E-ticaret Danışmanlığı",
      "Süreç & Proje Yönetimi",
      "Satış & E-ticaret Danışmanlığı",
      "İK & Kurumsal Eğitim",
    ],
    verbOverrides: {
      "Startup danışmanlığınızı": { verbs: ["veriyorum", "yürütüyorum", "planlıyorum", "yönetiyorum"], extraVerbs: ["detaylıca veriyorum", "baştan sona yürütüyorum", "detaylıca planlıyorum", "etkili yönetiyorum"] },
      "İş planınızı": { verbs: ["hazırlıyorum", "yazıyorum", "planlıyorum", "gözden geçiriyorum"], extraVerbs: ["özenle hazırlıyorum", "sıfırdan yazıyorum", "detaylıca planlıyorum", "baştan sona gözden geçiriyorum"] },
      "Finansal projeksiyonlarınızı": { verbs: ["hazırlıyorum", "modelliyorum", "güncelliyorum", "gözden geçiriyorum"], extraVerbs: ["özenle hazırlıyorum", "detaylıca modelliyorum", "periyodik güncelliyorum", "baştan sona gözden geçiriyorum"] },
      "Yatırımcı sunumunuzu (pitch deck)": { verbs: ["hazırlıyorum", "yazıyorum", "tasarlıyorum", "güçlendiriyorum"], extraVerbs: ["özenle hazırlıyorum", "sıfırdan yazıyorum", "profesyonelce tasarlıyorum", "belirgin şekilde güçlendiriyorum"] },
      "Pazarlama stratejinizi": { verbs: ["kuruyorum", "hazırlıyorum", "planlıyorum", "yönetiyorum"], extraVerbs: ["sıfırdan kuruyorum", "özenle hazırlıyorum", "detaylıca planlıyorum", "etkili yönetiyorum"] },
      "Marka stratejinizi": { verbs: ["kuruyorum", "hazırlıyorum", "planlıyorum", "yönetiyorum"], extraVerbs: ["sıfırdan kuruyorum", "özenle hazırlıyorum", "detaylıca planlıyorum", "etkili yönetiyorum"] },
      "Kurumsal eğitim programınızı": { verbs: ["hazırlıyorum", "planlıyorum", "yürütüyorum", "tasarlıyorum"], extraVerbs: ["özenle hazırlıyorum", "detaylıca planlıyorum", "baştan sona yürütüyorum", "kurumunuza özel tasarlıyorum"] },
    },
    priceMin: 3000,
    priceMax: 17000,
    deliveryMin: 2,
    deliveryMax: 10,
    coverColors: ["amber", "emerald"],
  },
  {
    slug: "egitim-ders",
    sellerTitle: "Eğitmen",
    verbs: ["veriyorum", "hazırlıyorum", "anlatıyorum", "planlıyorum"],
    extraVerbs: ["birebir veriyorum", "özenle hazırlıyorum", "sabırla anlatıyorum", "detaylıca planlıyorum"],
    subjects: [
      "Matematik dersinizi",
      "İngilizce konuşma pratiğinizi",
      "Yazılım eğitiminizi",
      "Grafik tasarım eğitiminizi",
      "Gitar dersinizi",
      "Sınav hazırlık programınızı",
      "Excel eğitiminizi",
      "Dijital pazarlama eğitiminizi",
      "Fotoğrafçılık dersinizi",
      "Yoga ve nefes dersinizi",
      "Kişisel gelişim koçluğunuzu",
      "Kariyer danışmanlığınızı",
    ],
    subcategories: [
      "Akademik Dersler",
      "Dil Eğitimi",
      "Yazılım & Ofis Eğitimi",
      "Tasarım & Dijital Beceri Eğitimi",
      "Sanat & Hobi Dersleri",
      "Akademik Dersler",
      "Yazılım & Ofis Eğitimi",
      "Tasarım & Dijital Beceri Eğitimi",
      "Sanat & Hobi Dersleri",
      "Kişisel Gelişim & Kariyer Koçluğu",
      "Kişisel Gelişim & Kariyer Koçluğu",
      "Kişisel Gelişim & Kariyer Koçluğu",
    ],
    verbOverrides: {
      "Kişisel gelişim koçluğunuzu": { verbs: ["veriyorum", "planlıyorum", "yürütüyorum", "yapıyorum"], extraVerbs: ["birebir veriyorum", "detaylıca planlıyorum", "baştan sona yürütüyorum", "profesyonelce yapıyorum"] },
      "Kariyer danışmanlığınızı": { verbs: ["veriyorum", "planlıyorum", "yürütüyorum", "yapıyorum"], extraVerbs: ["birebir veriyorum", "detaylıca planlıyorum", "baştan sona yürütüyorum", "profesyonelce yapıyorum"] },
      "Sınav hazırlık programınızı": { verbs: ["hazırlıyorum", "planlıyorum", "yürütüyorum", "takip ediyorum"], extraVerbs: ["özenle hazırlıyorum", "detaylıca planlıyorum", "baştan sona yürütüyorum", "düzenli takip ediyorum"] },
    },
    priceMin: 600,
    priceMax: 4000,
    deliveryMin: 1,
    deliveryMax: 3,
    coverColors: ["violet", "amber"],
  },
  {
    slug: "ai-otomasyon",
    sellerTitle: "AI & Otomasyon Danışmanı",
    verbs: ["kuruyorum", "geliştiriyorum", "entegre ediyorum", "otomatikleştiriyorum"],
    extraVerbs: ["sıfırdan kuruyorum", "özel olarak geliştiriyorum", "sorunsuz entegre ediyorum", "tam otomatik hale getiriyorum"],
    subjects: [
      "Müşteri destek chatbotunuzu",
      "Zapier/Make iş akışlarınızı",
      "ChatGPT tabanlı asistanınızı",
      "Veri girişi süreçlerinizi",
      "E-posta otomasyonunuzu",
      "WhatsApp bot entegrasyonunuzu",
      "İçerik üretim otomasyonunuzu",
      "CRM otomasyon akışınızı",
      "AI destekli rapor sisteminizi",
      "Ses/metin AI entegrasyonunuzu",
      "n8n otomasyon senaryonuzu",
      "Yapay zeka danışmanlık sürecinizi",
    ],
    subcategories: [
      "Chatbot Geliştirme",
      "İş Akışı Otomasyonu (Zapier/Make/n8n)",
      "AI Asistan & İçerik Üretimi",
      "Veri & CRM Otomasyonu",
      "AI Entegrasyonları",
      "Chatbot Geliştirme",
      "AI Asistan & İçerik Üretimi",
      "Veri & CRM Otomasyonu",
      "AI Danışmanlığı & Raporlama",
      "AI Entegrasyonları",
      "İş Akışı Otomasyonu (Zapier/Make/n8n)",
      "AI Danışmanlığı & Raporlama",
    ],
    priceMin: 4000,
    priceMax: 26000,
    deliveryMin: 3,
    deliveryMax: 14,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "veri-analitik",
    sellerTitle: "Veri Analisti",
    verbs: ["hazırlıyorum", "kuruyorum", "analiz ediyorum", "raporluyorum"],
    extraVerbs: ["detaylıca hazırlıyorum", "sıfırdan kuruyorum", "derinlemesine analiz ediyorum", "düzenli raporluyorum"],
    subjects: [
      "Satış verilerinizi",
      "Power BI panelinizi",
      "Google Analytics kurulumunuzu",
      "Excel raporlama sisteminizi",
      "Müşteri segmentasyonunuzu",
      "Pazarlama performans raporunuzu",
      "SQL veritabanı sorgularınızı",
      "A/B test analizinizi",
      "KPI izleme panelinizi",
      "Finansal veri modelinizi",
      "Envanter analiz sisteminizi",
      "Web sitesi trafik analizinizi",
    ],
    subcategories: [
      "Satış & Pazarlama Analitiği",
      "Dashboard & Raporlama (Power BI/Excel)",
      "Web & Trafik Analitiği",
      "Dashboard & Raporlama (Power BI/Excel)",
      "Müşteri & Test Analizi",
      "Satış & Pazarlama Analitiği",
      "Veritabanı & SQL Analizi",
      "Müşteri & Test Analizi",
      "Dashboard & Raporlama (Power BI/Excel)",
      "Finansal & Envanter Analizi",
      "Finansal & Envanter Analizi",
      "Web & Trafik Analitiği",
    ],
    verbOverrides: {
      "Satış verilerinizi": { verbs: ["analiz ediyorum", "raporluyorum", "görselleştiriyorum", "yorumluyorum"], extraVerbs: ["derinlemesine analiz ediyorum", "düzenli raporluyorum", "anlaşılır şekilde görselleştiriyorum", "detaylıca yorumluyorum"] },
      "Müşteri segmentasyonunuzu": { verbs: ["yapıyorum", "analiz ediyorum", "raporluyorum", "modelliyorum"], extraVerbs: ["profesyonelce yapıyorum", "derinlemesine analiz ediyorum", "düzenli raporluyorum", "detaylıca modelliyorum"] },
      "Pazarlama performans raporunuzu": { verbs: ["hazırlıyorum", "raporluyorum", "yorumluyorum", "güncelliyorum"], extraVerbs: ["detaylıca hazırlıyorum", "düzenli raporluyorum", "derinlemesine yorumluyorum", "periyodik güncelliyorum"] },
      "SQL veritabanı sorgularınızı": { verbs: ["yazıyorum", "optimize ediyorum", "düzenliyorum", "hızlandırıyorum"], extraVerbs: ["sıfırdan yazıyorum", "baştan sona optimize ediyorum", "yeniden düzenliyorum", "belirgin şekilde hızlandırıyorum"] },
      "A/B test analizinizi": { verbs: ["yapıyorum", "analiz ediyorum", "raporluyorum", "yorumluyorum"], extraVerbs: ["profesyonelce yapıyorum", "derinlemesine analiz ediyorum", "düzenli raporluyorum", "detaylıca yorumluyorum"] },
      "Web sitesi trafik analizinizi": { verbs: ["yapıyorum", "analiz ediyorum", "raporluyorum", "yorumluyorum"], extraVerbs: ["profesyonelce yapıyorum", "derinlemesine analiz ediyorum", "düzenli raporluyorum", "detaylıca yorumluyorum"] },
      "Google Analytics kurulumunuzu": { verbs: ["yapıyorum", "kuruyorum", "yapılandırıyorum", "optimize ediyorum"], extraVerbs: ["profesyonelce yapıyorum", "sıfırdan kuruyorum", "eksiksiz yapılandırıyorum", "baştan sona optimize ediyorum"] },
    },
    priceMin: 3000,
    priceMax: 19000,
    deliveryMin: 2,
    deliveryMax: 8,
    coverColors: ["emerald", "violet"],
  },
];

const firstNames = [
  "Ahmet", "Mehmet", "Fatma", "Emre", "Selin", "Kerem", "Ece", "Onur", "Buse", "Kaan",
  "Yusuf", "Ceren", "Barış", "Gizem", "Tolga", "Naz", "Serkan", "Pelin", "Emir", "İrem",
  "Volkan", "Sude", "Berk", "Melis", "Arda", "Cem", "Hazal", "Umut", "Sena", "Cansu",
  "Efe", "Yasemin", "Alp", "Derya", "Oğuz", "Nil", "Kemal", "Beril", "Tarık", "Sibel",
  "Gökhan", "Aylin", "Baran", "Merve", "İlker", "Nihan", "Doruk", "Simge", "Batu", "Ceyda",
  "Uğur", "Damla", "Eren", "Selen", "Koray", "Aslıhan", "Fırat", "Duygu", "Kağan", "Ebru",
  "Bora", "Elvan", "Sarp", "Yağmur", "Kutay", "Zehra", "Metin", "Aycan", "Rüya", "Kıvanç",
  "Esin", "Bertan", "Nurcan", "Tayfun", "Gamze", "Erhan", "Buğra", "Sinem", "Cenk", "Aybüke",
  "Halil", "Songül", "Mesut", "Perihan", "Taner", "Şeyma", "Bahadır", "Özge", "Reha", "Nazlı",
  "Yiğit", "Selma", "Orkun", "Beste", "Timur", "Filiz", "Necati", "Aytekin", "Gülce", "Rıza",
  "Nesrin", "Kaya", "Belgin", "Semih", "Ayten", "Doğukan", "Feride", "Salih", "Türkan", "Yavuz",
  "Ilgın", "Cansel", "Burcu", "Deren", "Meltem", "Onat", "Gonca", "İbrahim", "Sevgi", "Aras",
];

const lastInitials = [
  "A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "K.", "L.",
  "M.", "N.", "O.", "P.", "R.", "S.", "T.", "U.", "V.", "Y.",
];

const descriptionTemplates = [
  "Bu alanda yılların verdiği deneyimle çalışıyorum. Kaliteli işçilik, zamanında teslim ve 2 revizyon hakkı dahildir.",
  "İhtiyacınıza özel, profesyonel bir çalışma sunuyorum. Net iletişim, hızlı teslimat ve revizyon desteği garantili.",
  "Detaylara özen göstererek markanıza değer katacak bir sonuç hedefliyorum. Kaynak dosyalar ve 2 revizyon dahildir.",
  "Süreç boyunca sizinle yakın iletişimde kalarak beklentilerinize en uygun sonucu üretiyorum.",
];

export type BulkSeller = { email: string; name: string; title: string };
export type BulkSubcategory = { name: string; slug: string; categorySlug: string };
export type BulkGig = {
  sellerEmail: string;
  categorySlug: string;
  subcategorySlug: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  delivery: number;
  coverColor: string;
};

/** Falls back to the category verbs when a subject has no list of its own. */
function verbsFor(cat: CategoryContent, subject: string, wave: "base" | "extra") {
  const override = cat.verbOverrides?.[subject];
  if (override) return wave === "base" ? override.verbs : override.extraVerbs;
  return wave === "base" ? cat.verbs : cat.extraVerbs;
}

export const GIGS_PER_CATEGORY_GENERATED = 48;
const SELLERS_PER_CATEGORY = 6;
// Second wave: appended after the original data so existing gigs/sellers/slugs never change.
export const EXTRA_GIGS_PER_CATEGORY_GENERATED = 48;
const EXTRA_SELLERS_PER_CATEGORY = 14;

function buildGig(
  cat: CategoryContent,
  subjectIndex: number,
  verb: string,
  variantIndex: number,
  seller: BulkSeller,
  subcategorySlug: string,
  usedSlugs: Set<string>
): BulkGig {
  const subject = cat.subjects[subjectIndex];
  const title = `${subject} ${verb}`;

  let slug = slugify(title);
  let attempt = 1;
  while (usedSlugs.has(slug)) {
    attempt++;
    slug = `${slugify(title)}-${attempt}`;
  }
  usedSlugs.add(slug);

  const h = hash(slug);

  const priceRange = cat.priceMax - cat.priceMin;
  const price = Math.round((cat.priceMin + (h % priceRange)) / 50) * 50;

  const deliveryRange = cat.deliveryMax - cat.deliveryMin + 1;
  const delivery = cat.deliveryMin + ((h >>> 8) % deliveryRange);

  const coverColor = cat.coverColors[variantIndex % cat.coverColors.length];
  const description = descriptionTemplates[h % descriptionTemplates.length];

  return {
    sellerEmail: seller.email,
    categorySlug: cat.slug,
    subcategorySlug,
    title,
    slug,
    description,
    price,
    delivery,
    coverColor,
  };
}

export function generateBulkData(): {
  sellers: BulkSeller[];
  subcategories: BulkSubcategory[];
  gigs: BulkGig[];
} {
  const sellers: BulkSeller[] = [];
  const subcategories: BulkSubcategory[] = [];
  const gigs: BulkGig[] = [];
  const usedSlugs = new Set<string>();
  const usedSubcategorySlugs = new Set<string>();
  let sellerCounter = 0;
  let extraSellerCounter = categoryContents.length * SELLERS_PER_CATEGORY;

  for (const cat of categoryContents) {
    const catSellers: BulkSeller[] = [];
    for (let s = 0; s < SELLERS_PER_CATEGORY; s++) {
      const name = firstNames[sellerCounter % firstNames.length];
      const initial = lastInitials[sellerCounter % lastInitials.length];
      const email = `fl${sellerCounter + 1}@profestia.dev`;
      const seller = { email, name: `${name} ${initial}`, title: cat.sellerTitle };
      catSellers.push(seller);
      sellers.push(seller);
      sellerCounter++;
    }

    const catSubcategorySlugs = new Map<string, string>();
    for (const name of cat.subcategories) {
      if (catSubcategorySlugs.has(name)) continue;
      const baseSlug = slugify(`${cat.slug}-${name}`);
      let slug = baseSlug;
      let attempt = 1;
      while (usedSubcategorySlugs.has(slug)) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
      usedSubcategorySlugs.add(slug);
      catSubcategorySlugs.set(name, slug);
      subcategories.push({ name, slug, categorySlug: cat.slug });
    }

    for (let i = 0; i < GIGS_PER_CATEGORY_GENERATED; i++) {
      const subjectIndex = i % cat.subjects.length;
      const subjectVerbs = verbsFor(cat, cat.subjects[subjectIndex], "base");
      const verb = subjectVerbs[Math.floor(i / cat.subjects.length) % subjectVerbs.length];
      const subcategorySlug = catSubcategorySlugs.get(cat.subcategories[subjectIndex])!;
      const seller = catSellers[i % catSellers.length];
      gigs.push(buildGig(cat, subjectIndex, verb, i, seller, subcategorySlug, usedSlugs));
    }

    const catExtraSellers: BulkSeller[] = [];
    for (let s = 0; s < EXTRA_SELLERS_PER_CATEGORY; s++) {
      const name = firstNames[extraSellerCounter % firstNames.length];
      const initial = lastInitials[extraSellerCounter % lastInitials.length];
      const email = `fl${extraSellerCounter + 1}@profestia.dev`;
      const seller = { email, name: `${name} ${initial}`, title: cat.sellerTitle };
      catExtraSellers.push(seller);
      sellers.push(seller);
      extraSellerCounter++;
    }
    const combinedSellers = [...catSellers, ...catExtraSellers];

    for (let i = 0; i < EXTRA_GIGS_PER_CATEGORY_GENERATED; i++) {
      const subjectIndex = i % cat.subjects.length;
      const subjectVerbs = verbsFor(cat, cat.subjects[subjectIndex], "extra");
      const verb = subjectVerbs[Math.floor(i / cat.subjects.length) % subjectVerbs.length];
      const subcategorySlug = catSubcategorySlugs.get(cat.subcategories[subjectIndex])!;
      const seller = combinedSellers[i % combinedSellers.length];
      gigs.push(buildGig(cat, subjectIndex, verb, i, seller, subcategorySlug, usedSlugs));
    }
  }

  return { sellers, subcategories, gigs };
}
