/**
 * Generates the synthetic freelancer profiles that fill the marketplace.
 *
 * Every profile is derived from its own index, so the same call always produces the
 * same thousand people: re-running the generator updates the rows it made last time
 * instead of creating a second thousand with different names. Nothing here touches the
 * database — `scripts/generate-freelancers.ts` and `prisma/seed.ts` do the writing, and
 * both only write rows flagged `synthetic`, so a real sign-up is never overwritten.
 *
 * Professions are handed out round-robin over the whole list, which keeps every
 * category equally staffed; name, age, city, skills and the avatar come from a hash of
 * the e-mail, so two people with the same profession still look nothing alike.
 */

export type SyntheticFreelancer = {
  email: string;
  name: string;
  /** Meslek — shown under the name, same field the app already uses for a seller title. */
  title: string;
  age: number;
  city: string;
  /** Uzmanlık — three to five concrete things this person does. */
  skills: string[];
  /** Profile photo: a drawn avatar served by /api/avatar/[seed], unique per profile. */
  image: string;
  bio: string;
  categorySlug: string;
  isOnline: boolean;
  isPro: boolean;
};

/**
 * The older demo sellers — the eight the seed writes by hand and fl1..fl200 from the
 * bulk catalogue — already have a name, a title and listings, but none of the profile
 * details this module produces. `describeShowcaseFreelancer` fills in the rest from the
 * same pools so they do not sit next to the generated thousand looking half-finished.
 * Their name and title are left alone: listings, reviews and the demo login table in the
 * README all refer to them.
 */
export type ShowcaseProfile = {
  email: string;
  age: number;
  city: string;
  skills: string[];
  image: string;
  bio: string;
};

export const SYNTHETIC_FREELANCER_COUNT = 1000;

/** These profiles are showcase content; nobody logs into them. */
export const SYNTHETIC_PASSWORD_HASH = "!showcase-profile-no-login";

/** The addresses reserved for generated profiles: uzman1@… through uzman1000@…. */
const SYNTHETIC_EMAIL_PREFIX = "uzman";
const SYNTHETIC_EMAIL_DOMAIN = "profestia.dev";

type Profession = {
  title: string;
  skills: string[];
};

type CategoryProfessions = {
  categorySlug: string;
  professions: Profession[];
};

const catalogue: CategoryProfessions[] = [
  {
    categorySlug: "ai-otomasyon",
    professions: [
      {
        title: "Yapay Zekâ Geliştiricisi",
        skills: ["LLM Entegrasyonu", "OpenAI API", "RAG Mimarisi", "Vektör Veritabanları", "Python", "Model İnce Ayarı", "LangChain"],
      },
      {
        title: "Otomasyon Uzmanı",
        skills: ["Zapier", "Make (Integromat)", "n8n", "Webhook Entegrasyonu", "Google Apps Script", "Airtable", "Süreç Haritalama"],
      },
      {
        title: "Chatbot Geliştiricisi",
        skills: ["WhatsApp Business API", "Dialogflow", "Sohbet Akışı Tasarımı", "Doğal Dil İşleme", "Node.js", "Canlı Destek Entegrasyonu"],
      },
      {
        title: "Prompt Mühendisi",
        skills: ["Prompt Tasarımı", "İçerik Otomasyonu", "Değerlendirme Setleri", "Token Optimizasyonu", "Çok Adımlı Akışlar", "Doküman Özetleme"],
      },
      {
        title: "Makine Öğrenmesi Mühendisi",
        skills: ["Python", "PyTorch", "scikit-learn", "Öznitelik Mühendisliği", "Tahmin Modelleri", "Görüntü İşleme", "MLOps"],
      },
      {
        title: "RPA Danışmanı",
        skills: ["UiPath", "Power Automate", "Robotik Süreç Otomasyonu", "Excel Makroları", "ERP Entegrasyonu", "Süreç Madenciliği"],
      },
    ],
  },
  {
    categorySlug: "yazilim-web",
    professions: [
      {
        title: "Full Stack Geliştirici",
        skills: ["Next.js", "React", "Node.js", "PostgreSQL", "TypeScript", "REST API", "Prisma", "Docker"],
      },
      {
        title: "Frontend Geliştirici",
        skills: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "Erişilebilirlik", "Figma'dan Koda", "Performans Optimizasyonu"],
      },
      {
        title: "Backend Geliştirici",
        skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Mikroservisler", "GraphQL", "Kimlik Doğrulama", "AWS"],
      },
      {
        title: "Mobil Uygulama Geliştiricisi",
        skills: ["React Native", "Flutter", "iOS", "Android", "App Store Yayını", "Push Bildirim", "Mobil Arayüz"],
      },
      {
        title: "WordPress Uzmanı",
        skills: ["WordPress", "WooCommerce", "Elementor", "Tema Geliştirme", "Eklenti Geliştirme", "Site Hızlandırma", "Site Güvenliği"],
      },
      {
        title: "E-ticaret Geliştiricisi",
        skills: ["Shopify", "WooCommerce", "iyzico Entegrasyonu", "Kargo Entegrasyonu", "Ürün Feed Yönetimi", "Dönüşüm Optimizasyonu"],
      },
      {
        title: "DevOps Mühendisi",
        skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "İzleme & Loglama", "Sunucu Yönetimi"],
      },
    ],
  },
  {
    categorySlug: "grafik-tasarim",
    professions: [
      {
        title: "Grafik Tasarımcı",
        skills: ["Adobe Illustrator", "Photoshop", "InDesign", "Tipografi", "Baskı Tasarımı", "Sosyal Medya Görselleri", "Renk Teorisi"],
      },
      {
        title: "Logo & Marka Tasarımcısı",
        skills: ["Logo Tasarımı", "Marka Kimliği", "Kurumsal Kimlik", "Marka Kılavuzu", "Vektör Çizim", "Tipografi"],
      },
      {
        title: "UI/UX Tasarımcısı",
        skills: ["Figma", "Kullanıcı Araştırması", "Wireframe", "Prototipleme", "Tasarım Sistemi", "Kullanılabilirlik Testi", "Mobil Arayüz"],
      },
      {
        title: "İllüstratör",
        skills: ["Dijital İllüstrasyon", "Procreate", "Karakter Tasarımı", "Vektör Çizim", "İkon Seti", "Kitap İllüstrasyonu"],
      },
      {
        title: "Ambalaj Tasarımcısı",
        skills: ["Ambalaj Tasarımı", "Etiket Tasarımı", "3D Mockup", "Baskı Ön Hazırlık", "Malzeme Seçimi", "Raf Görünürlüğü"],
      },
      {
        title: "Sunum Tasarımcısı",
        skills: ["PowerPoint", "Keynote", "Google Slides", "Bilgi Grafiği", "Yatırımcı Sunumu", "Şablon Tasarımı"],
      },
    ],
  },
  {
    categorySlug: "dijital-pazarlama",
    professions: [
      {
        title: "Dijital Pazarlama Uzmanı",
        skills: ["Pazarlama Stratejisi", "Google Analytics", "Dönüşüm Optimizasyonu", "Huni Kurgusu", "A/B Testi", "Raporlama"],
      },
      {
        title: "SEO Uzmanı",
        skills: ["Anahtar Kelime Araştırması", "Teknik SEO", "Backlink Stratejisi", "Google Search Console", "İçerik Optimizasyonu", "Yerel SEO"],
      },
      {
        title: "Sosyal Medya Yöneticisi",
        skills: ["Instagram", "TikTok", "İçerik Takvimi", "Topluluk Yönetimi", "Reels Kurgusu", "Sosyal Medya Analitiği"],
      },
      {
        title: "Google Ads Uzmanı",
        skills: ["Google Ads", "Arama Ağı Kampanyaları", "Performance Max", "Dönüşüm Takibi", "Teklif Stratejileri", "Yeniden Pazarlama"],
      },
      {
        title: "Meta Reklam Uzmanı",
        skills: ["Meta Ads", "Facebook Pixel", "Hedef Kitle Kurgusu", "Kreatif Testi", "Katalog Reklamları", "Dönüşüm API"],
      },
      {
        title: "E-posta Pazarlama Uzmanı",
        skills: ["Mailchimp", "Otomasyon Akışları", "Segmentasyon", "Bülten Tasarımı", "A/B Testi", "CRM Entegrasyonu"],
      },
    ],
  },
  {
    categorySlug: "veri-analitik",
    professions: [
      {
        title: "Veri Analisti",
        skills: ["SQL", "Excel", "Power BI", "Veri Temizleme", "Görselleştirme", "KPI Takibi", "Google Analytics"],
      },
      {
        title: "Veri Bilimci",
        skills: ["Python", "pandas", "İstatistiksel Modelleme", "Makine Öğrenmesi", "Talep Tahmini", "A/B Test Analizi"],
      },
      {
        title: "Power BI Uzmanı",
        skills: ["Power BI", "DAX", "Power Query", "Veri Modelleme", "Dashboard Tasarımı", "Otomatik Raporlama"],
      },
      {
        title: "Veri Mühendisi",
        skills: ["ETL Süreçleri", "Airflow", "SQL", "Veri Ambarı", "BigQuery", "Python", "Veri Kalitesi"],
      },
      {
        title: "İş Analisti",
        skills: ["Süreç Analizi", "Gereksinim Toplama", "Excel Modelleme", "SQL", "Raporlama", "Paydaş Yönetimi"],
      },
      {
        title: "Web Analitiği Uzmanı",
        skills: ["Google Analytics 4", "Google Tag Manager", "Dönüşüm Takibi", "Olay Kurulumu", "Looker Studio", "E-ticaret Takibi"],
      },
    ],
  },
  {
    categorySlug: "is-danismanlik",
    professions: [
      {
        title: "İş Danışmanı",
        skills: ["İş Planı", "Pazar Araştırması", "Süreç İyileştirme", "Fizibilite Analizi", "Büyüme Stratejisi", "Rakip Analizi"],
      },
      {
        title: "Finansal Danışman",
        skills: ["Nakit Akışı Yönetimi", "Bütçeleme", "Finansal Modelleme", "Yatırım Analizi", "Maliyet Analizi", "Finansal Raporlama"],
      },
      {
        title: "Proje Yöneticisi",
        skills: ["Scrum", "Agile", "Jira", "Risk Yönetimi", "Kaynak Planlama", "Paydaş İletişimi"],
      },
      {
        title: "İnsan Kaynakları Danışmanı",
        skills: ["İşe Alım Süreçleri", "Performans Yönetimi", "Mülakat Teknikleri", "Oryantasyon", "İK Politikaları", "Görev Tanımları"],
      },
      {
        title: "Marka Danışmanı",
        skills: ["Marka Konumlandırma", "Marka Sesi", "Rakip Analizi", "Pazar Segmentasyonu", "İsimlendirme", "Marka Kılavuzu"],
      },
      {
        title: "Mali Müşavir",
        skills: ["Vergi Danışmanlığı", "E-fatura", "Şirket Kuruluşu", "Beyanname Hazırlama", "Muhasebe Denetimi", "Teşvik Danışmanlığı"],
      },
    ],
  },
  {
    categorySlug: "yazi-ceviri",
    professions: [
      {
        title: "İçerik Yazarı",
        skills: ["Blog Yazarlığı", "SEO Uyumlu İçerik", "Anahtar Kelime Araştırması", "Ürün Açıklaması", "İçerik Planı", "Editörlük"],
      },
      {
        title: "Metin Yazarı",
        skills: ["Reklam Metni", "Satış Metni", "Marka Sesi", "Slogan", "E-posta Metni", "Açılış Sayfası Metni"],
      },
      {
        title: "Çevirmen",
        skills: ["İngilizce-Türkçe Çeviri", "Almanca-Türkçe Çeviri", "Teknik Çeviri", "Web Sitesi Yerelleştirme", "Altyazı Çevirisi", "Redaksiyon"],
      },
      {
        title: "Editör",
        skills: ["Redaksiyon", "Son Okuma", "Dil Bilgisi Denetimi", "Stil Kılavuzu", "Yayın Hazırlığı", "Kurgu Düzenleme"],
      },
      {
        title: "Teknik Yazar",
        skills: ["Kullanım Kılavuzu", "API Dokümantasyonu", "Yardım Merkezi İçeriği", "Markdown", "Sürüm Notları", "Bilgi Tabanı"],
      },
      {
        title: "Akademik Editör",
        skills: ["Akademik Redaksiyon", "Literatür Taraması", "APA Formatı", "Kaynakça Düzenleme", "Dergi Yayın Hazırlığı", "Özet Düzenleme"],
      },
    ],
  },
  {
    categorySlug: "video-animasyon",
    professions: [
      {
        title: "Video Editörü",
        skills: ["Adobe Premiere Pro", "DaVinci Resolve", "Renk Düzenleme", "Altyazı", "YouTube Kurgusu", "Reels & Shorts"],
      },
      {
        title: "Motion Designer",
        skills: ["After Effects", "Logo Animasyonu", "Kinetik Tipografi", "Geçiş Efektleri", "Alt Bant Tasarımı", "Sosyal Medya Animasyonu"],
      },
      {
        title: "2D Animatör",
        skills: ["Karakter Animasyonu", "Storyboard", "Açıklayıcı Video", "Frame-by-Frame Animasyon", "Rigging", "After Effects"],
      },
      {
        title: "3D Animatör",
        skills: ["Blender", "Cinema 4D", "3D Modelleme", "Ürün Görselleştirme", "Işıklandırma", "Render"],
      },
      {
        title: "Videografist",
        skills: ["Kamera Çekimi", "Işık Kurulumu", "Tanıtım Filmi", "Drone Çekimi", "Röportaj Çekimi", "Ürün Videosu"],
      },
      {
        title: "Kurgu Yönetmeni",
        skills: ["Kurgu Ritmi", "Senaryo Akışı", "Storyboard", "Reklam Filmi", "Belgesel Kurgu", "Renk Uyumu"],
      },
    ],
  },
  {
    categorySlug: "egitim-ders",
    professions: [
      {
        title: "Yazılım Eğitmeni",
        skills: ["Python Eğitimi", "JavaScript Eğitimi", "Birebir Ders", "Proje Tabanlı Öğretim", "Kod İnceleme", "Ödev Takibi"],
      },
      {
        title: "İngilizce Öğretmeni",
        skills: ["Konuşma Pratiği", "IELTS Hazırlık", "İş İngilizcesi", "Gramer", "Sınav Hazırlığı", "Birebir Ders"],
      },
      {
        title: "Matematik Öğretmeni",
        skills: ["LGS Hazırlık", "YKS Hazırlık", "Konu Anlatımı", "Soru Çözümü", "Deneme Analizi", "Birebir Ders"],
      },
      {
        title: "Kariyer Koçu",
        skills: ["Özgeçmiş Danışmanlığı", "Mülakat Hazırlığı", "LinkedIn Profili", "Kariyer Planlama", "Kişisel Marka", "Maaş Görüşmesi"],
      },
      {
        title: "Tasarım Eğitmeni",
        skills: ["Figma Eğitimi", "Photoshop Eğitimi", "Tasarım Temelleri", "Portfolyo Danışmanlığı", "Proje Geri Bildirimi", "Birebir Ders"],
      },
      {
        title: "Müzik Eğitmeni",
        skills: ["Gitar Dersi", "Piyano Dersi", "Nota Okuma", "Şan Dersi", "Müzik Teorisi", "Birebir Ders"],
      },
    ],
  },
  {
    categorySlug: "muzik-ses",
    professions: [
      {
        title: "Seslendirme Sanatçısı",
        skills: ["Reklam Seslendirme", "Kurumsal Tanıtım", "Belgesel Anlatım", "Karakter Seslendirme", "Stüdyo Kaydı", "İngilizce Seslendirme"],
      },
      {
        title: "Müzik Prodüktörü",
        skills: ["Aranjman", "Beat Yapımı", "Logic Pro", "Ableton Live", "Enstrüman Kaydı", "Şarkı Düzenleme"],
      },
      {
        title: "Mix & Mastering Uzmanı",
        skills: ["Miksaj", "Mastering", "Pro Tools", "Ses Temizleme", "Ekolayzer", "Kompresyon"],
      },
      {
        title: "Podcast Editörü",
        skills: ["Podcast Kurgu", "Gürültü Temizleme", "Ses Seviyeleme", "Jenerik Hazırlama", "Bölüm Yayını", "Transkripsiyon"],
      },
      {
        title: "Ses Tasarımcısı",
        skills: ["Efekt Tasarımı", "Oyun Sesleri", "Foley", "Atmosfer Kurgusu", "Ses Kütüphanesi", "Video Ses Tasarımı"],
      },
      {
        title: "Besteci",
        skills: ["Jingle", "Reklam Müziği", "Film Müziği", "Orkestrasyon", "Telifsiz Müzik", "Enstrümantal Beste"],
      },
    ],
  },
];

/**
 * First names are kept in two lists because the drawn avatar follows the name: a
 * profile called Elif should not come back with a beard. The list a name comes from is
 * the only thing gender is used for.
 */
const feminineNames = [
  "Elif", "Zeynep", "Ayşe", "Fatma", "Merve", "Selin", "Ece", "Buse", "Ceren", "Gizem",
  "Naz", "Pelin", "İrem", "Sude", "Melis", "Hazal", "Sena", "Cansu", "Yasemin", "Derya",
  "Nil", "Beril", "Sibel", "Aylin", "Nihan", "Simge", "Ceyda", "Damla", "Selen", "Aslıhan",
  "Duygu", "Ebru", "Elvan", "Yağmur", "Zehra", "Esin", "Nurcan", "Gamze", "Sinem", "Aybüke",
  "Songül", "Perihan", "Şeyma", "Özge", "Nazlı", "Selma", "Beste", "Filiz", "Gülce", "Nesrin",
  "Belgin", "Ayten", "Feride", "Türkan", "Cansel", "Burcu", "Meltem", "Gonca", "Sevgi", "Dilara",
  "Melike", "Eda", "Tuğçe", "Berrak", "Hande", "Şevval", "İpek", "Bengi", "Ayça", "Şule",
  "Neslihan", "Rüya", "Ilgın", "Deren", "Aycan", "Betül", "Esra", "Öykü", "Defne", "Zeliha",
  "Bahar", "Çiğdem", "Seda", "Tuba", "Yeliz", "Nuray", "Sevil", "Ceyhan", "Ela", "Lale",
];

const masculineNames = [
  "Ahmet", "Mehmet", "Emre", "Kerem", "Onur", "Kaan", "Yusuf", "Barış", "Tolga", "Serkan",
  "Emir", "Volkan", "Berk", "Arda", "Cem", "Umut", "Efe", "Alp", "Oğuz", "Kemal",
  "Tarık", "Gökhan", "Baran", "İlker", "Doruk", "Batu", "Uğur", "Eren", "Koray", "Fırat",
  "Kağan", "Bora", "Sarp", "Kutay", "Metin", "Kıvanç", "Bertan", "Tayfun", "Erhan", "Buğra",
  "Cenk", "Halil", "Mesut", "Taner", "Bahadır", "Reha", "Yiğit", "Orkun", "Timur", "Necati",
  "Rıza", "Kaya", "Semih", "Doğukan", "Salih", "Yavuz", "Onat", "İbrahim", "Aras", "Mert",
  "Can", "Deniz", "Burak", "Ozan", "Sinan", "Hakan", "Levent", "Murat", "Okan", "Tuna",
  "Cihan", "Ege", "Mustafa", "Ali", "Hasan", "Enes", "Furkan", "Berat", "Çağrı", "Selim",
  "Görkem", "Anıl", "Ufuk", "Sercan", "Erdem", "Tunahan", "Kadir", "Serdar", "Ünal", "Bülent",
];

/**
 * First names that appear in the older demo data but not in the pools above. They are
 * kept separate on purpose: adding one to the pools would shift every generated name
 * after it, and those names are already in a migration.
 */
const extraFeminineNames = ["Aslı"];
const extraMasculineNames = ["Aytekin"];

const feminineLookup = new Set([...feminineNames, ...extraFeminineNames]);
const masculineLookup = new Set([...masculineNames, ...extraMasculineNames]);

/** True feminine, false masculine, null when the name is in neither list. */
function looksFeminine(firstName: string): boolean | null {
  if (feminineLookup.has(firstName)) return true;
  if (masculineLookup.has(firstName)) return false;
  return null;
}

const surnames = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
  "Polat", "Korkmaz", "Erdoğan", "Bulut", "Aksoy", "Güneş", "Türk", "Aktaş", "Bozkurt", "Karaca",
  "Sarı", "Yavuz", "Kaplan", "Taş", "Duman", "Acar", "Güler", "Tekin", "Ateş", "Uysal",
  "Bilgin", "Ergün", "Sezer", "Ünal", "Avcı", "Çakır", "Erdem", "Toprak", "Başaran", "Gündüz",
  "Altun", "Balcı", "Tuncer", "Coşkun", "Koçak", "Ekinci", "Alkan", "Çiftçi", "Fidan", "Genç",
  "Işık", "Orhan", "Öner", "Saygın", "Tanrıverdi", "Uçar", "Vural", "Yalçın", "Zorlu", "Akgün",
  "Bilge", "Çınar", "Dinç", "Eroğlu", "Gökçe", "İnce", "Karadağ", "Kuzu", "Mutlu", "Özsoy",
  "Peker", "Sancak", "Şen", "Tunç", "Ulusoy", "Varol", "Yaman", "Zengin", "Baysal", "Çakmak",
  "Demirci", "Gürses", "Kabakçı", "Malkoç", "Narin", "Öz", "Sağlam", "Şeker", "Tosun", "Uğurlu",
  "Ünver", "Sevinç", "Kılınç", "Turan", "Bayram", "Aydemir", "Dursun", "Solmaz", "Özer", "Nalbant",
  "Serin", "Bayrak", "Soydan", "Baştürk", "Elmas", "Kanat", "Pekcan", "Akbulut", "Çiçek", "Doğru",
  "Ekici", "Güçlü", "Hancı", "Kandemir", "Levent", "Menteş", "Sarıkaya", "Topal", "Üstün", "Yurt",
];

/**
 * Cities carry their own locative form: Turkish suffixes follow vowel harmony and the
 * consonant before them, so "Gaziantep'te" and "Kocaeli'nde" cannot be produced by
 * gluing one ending onto every name. The weight is roughly how much of the country's
 * freelance work sits in each city, so the generated crowd clusters in İstanbul and
 * thins out towards Yalova instead of spreading evenly over 50 cities.
 */
const cities = [
  { name: "İstanbul", locative: "İstanbul'da", weight: 220 },
  { name: "Ankara", locative: "Ankara'da", weight: 110 },
  { name: "İzmir", locative: "İzmir'de", weight: 90 },
  { name: "Bursa", locative: "Bursa'da", weight: 45 },
  { name: "Antalya", locative: "Antalya'da", weight: 45 },
  { name: "Kocaeli", locative: "Kocaeli'nde", weight: 30 },
  { name: "Adana", locative: "Adana'da", weight: 28 },
  { name: "Konya", locative: "Konya'da", weight: 28 },
  { name: "Gaziantep", locative: "Gaziantep'te", weight: 25 },
  { name: "Eskişehir", locative: "Eskişehir'de", weight: 25 },
  { name: "Kayseri", locative: "Kayseri'de", weight: 22 },
  { name: "Mersin", locative: "Mersin'de", weight: 22 },
  { name: "Samsun", locative: "Samsun'da", weight: 18 },
  { name: "Denizli", locative: "Denizli'de", weight: 18 },
  { name: "Muğla", locative: "Muğla'da", weight: 18 },
  { name: "Trabzon", locative: "Trabzon'da", weight: 16 },
  { name: "Sakarya", locative: "Sakarya'da", weight: 16 },
  { name: "Balıkesir", locative: "Balıkesir'de", weight: 14 },
  { name: "Aydın", locative: "Aydın'da", weight: 14 },
  { name: "Manisa", locative: "Manisa'da", weight: 14 },
  { name: "Tekirdağ", locative: "Tekirdağ'da", weight: 12 },
  { name: "Diyarbakır", locative: "Diyarbakır'da", weight: 12 },
  { name: "Malatya", locative: "Malatya'da", weight: 10 },
  { name: "Erzurum", locative: "Erzurum'da", weight: 10 },
  { name: "Şanlıurfa", locative: "Şanlıurfa'da", weight: 10 },
  { name: "Van", locative: "Van'da", weight: 9 },
  { name: "Sivas", locative: "Sivas'ta", weight: 9 },
  { name: "Ordu", locative: "Ordu'da", weight: 8 },
  { name: "Çanakkale", locative: "Çanakkale'de", weight: 8 },
  { name: "Zonguldak", locative: "Zonguldak'ta", weight: 8 },
  { name: "Elazığ", locative: "Elazığ'da", weight: 7 },
  { name: "Kütahya", locative: "Kütahya'da", weight: 7 },
  { name: "Isparta", locative: "Isparta'da", weight: 7 },
  { name: "Afyonkarahisar", locative: "Afyonkarahisar'da", weight: 7 },
  { name: "Edirne", locative: "Edirne'de", weight: 6 },
  { name: "Rize", locative: "Rize'de", weight: 6 },
  { name: "Hatay", locative: "Hatay'da", weight: 6 },
  { name: "Bolu", locative: "Bolu'da", weight: 6 },
  { name: "Nevşehir", locative: "Nevşehir'de", weight: 5 },
  { name: "Uşak", locative: "Uşak'ta", weight: 5 },
  { name: "Amasya", locative: "Amasya'da", weight: 5 },
  { name: "Tokat", locative: "Tokat'ta", weight: 5 },
  { name: "Giresun", locative: "Giresun'da", weight: 5 },
  { name: "Çorum", locative: "Çorum'da", weight: 5 },
  { name: "Aksaray", locative: "Aksaray'da", weight: 4 },
  { name: "Karaman", locative: "Karaman'da", weight: 4 },
  { name: "Osmaniye", locative: "Osmaniye'de", weight: 4 },
  { name: "Düzce", locative: "Düzce'de", weight: 4 },
  { name: "Yalova", locative: "Yalova'da", weight: 4 },
  { name: "Kırklareli", locative: "Kırklareli'nde", weight: 4 },
];

function hash32(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  return hash >>> 0;
}

/** Deterministic 0..n-1 stream, so each decision about a profile gets its own bits. */
function reader(seed: number) {
  let state = seed || 1;
  return (n: number) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return n <= 1 ? 0 : state % n;
  };
}

/** Picks `count` distinct entries, keeping the pool's own order. */
function pickSome<T>(pool: readonly T[], count: number, r: (n: number) => number): T[] {
  const remaining = [...pool];
  const picked: T[] = [];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    picked.push(remaining.splice(r(remaining.length), 1)[0]);
  }
  return picked;
}

const cityWeightTotal = cities.reduce((sum, city) => sum + city.weight, 0);

function pickCity(r: (n: number) => number) {
  let draw = r(cityWeightTotal);
  for (const city of cities) {
    draw -= city.weight;
    if (draw < 0) return city;
  }
  return cities[0];
}

const professions = catalogue.flatMap((group) =>
  group.professions.map((profession) => ({ ...profession, categorySlug: group.categorySlug }))
);

function buildBio(
  firstName: string,
  title: string,
  years: number,
  city: { name: string; locative: string },
  skills: string[],
  r: (n: number) => number
) {
  const [first, second, third] = skills;
  const templates = [
    `Merhaba, ben ${firstName}. ${years} yıldır ${title} olarak çalışıyorum; özellikle ${first} ve ${second} işlerinde deneyimliyim. ${city.locative} yaşıyor, tüm Türkiye'ye uzaktan hizmet veriyorum.`,
    `${title} olarak ${years} yıllık deneyimim var. En çok ${first}, ${second} ve ${third ?? first} işlerinde çalışıyorum. ${city.name} merkezli çalışıyor, verdiğim teslim tarihine sadık kalıyorum.`,
    `${years} yıldır serbest çalışan bir ${title} olarak ${first} ve ${second} odaklı projeler üretiyorum. İşe başlamadan önce beklentini netleştirir, ilk taslağı hızlıca paylaşırım. Konum: ${city.name}.`,
    `${city.locative} yaşıyorum ve ${years} yıldır ${title} olarak proje üretiyorum. ${first}, ${second} ve ${third ?? second} başta olmak üzere işin tamamını uçtan uca yönetiyorum.`,
  ];
  return templates[r(templates.length)];
}

/**
 * The thousand profiles, in a stable order. `count` is only there so a smaller set can
 * be generated for a quick look; profile number 7 is the same person either way.
 */
export function generateSyntheticFreelancers(
  count: number = SYNTHETIC_FREELANCER_COUNT
): SyntheticFreelancer[] {
  const people: SyntheticFreelancer[] = [];
  const usedNames = new Set<string>();

  for (let index = 0; index < count; index++) {
    const email = `${SYNTHETIC_EMAIL_PREFIX}${index + 1}@${SYNTHETIC_EMAIL_DOMAIN}`;
    const r = reader(hash32(email));

    // Round-robin rather than a draw, so all ten categories stay equally staffed.
    const profession = professions[index % professions.length];

    const feminine = r(2) === 0;
    const firstNamePool = feminine ? feminineNames : masculineNames;
    let firstNameIndex = r(firstNamePool.length);
    let surnameIndex = r(surnames.length);
    let name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;

    // A repeat would give two profiles the same display name; walk the surnames, then
    // the first names, until this one is nobody else's.
    for (let taken = 0; usedNames.has(name); taken++) {
      surnameIndex = (surnameIndex + 1) % surnames.length;
      if (taken > 0 && taken % surnames.length === 0) {
        firstNameIndex = (firstNameIndex + 1) % firstNamePool.length;
      }
      name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;
    }
    usedNames.add(name);

    const age = 22 + Math.min(r(37), r(37));
    const city = pickCity(r);
    const skills = pickSome(profession.skills, 3 + r(3), r);
    // Nobody has been freelancing since they were a teenager, and nobody with twenty
    // years behind them is 25: the range is what is left after school.
    const years = Math.max(1, Math.min(age - 21, 2 + r(13)));

    const avatarSeed = `${feminine ? "k" : "e"}-${slugifyName(name)}-${index + 1}`;

    people.push({
      email,
      name,
      title: profession.title,
      age,
      city: city.name,
      skills,
      image: `/api/avatar/${avatarSeed}`,
      bio: buildBio(name.split(" ")[0], profession.title, years, city, skills, r),
      categorySlug: profession.categorySlug,
      isOnline: r(3) === 0,
      isPro: r(9) === 0,
    });
  }

  return people;
}

/**
 * What the older demo titles correspond to in the catalogue above. A profession is named
 * where one obviously matches; the rest are generic — an "Eğitmen" teaches anything — so
 * one profession is drawn from the category instead, which keeps a single person's
 * skills coherent rather than mixing guitar lessons with IELTS prep.
 */
const legacyTitles: Record<string, { category: string; profession?: string }> = {
  "AI & Otomasyon Danışmanı": { category: "ai-otomasyon", profession: "Otomasyon Uzmanı" },
  "Yazılım Geliştirici": { category: "yazilim-web" },
  "Full Stack Geliştirici": { category: "yazilim-web", profession: "Full Stack Geliştirici" },
  "Grafik Tasarımcı": { category: "grafik-tasarim", profession: "Grafik Tasarımcı" },
  "Logo & Marka Tasarımcısı": { category: "grafik-tasarim", profession: "Logo & Marka Tasarımcısı" },
  "Dijital Pazarlama Uzmanı": { category: "dijital-pazarlama", profession: "Dijital Pazarlama Uzmanı" },
  "Sosyal Medya Uzmanı": { category: "dijital-pazarlama", profession: "Sosyal Medya Yöneticisi" },
  "Reklam Yöneticisi": { category: "dijital-pazarlama", profession: "Google Ads Uzmanı" },
  "Veri Analisti": { category: "veri-analitik", profession: "Veri Analisti" },
  "İş Danışmanı": { category: "is-danismanlik", profession: "İş Danışmanı" },
  "İçerik Yazarı": { category: "yazi-ceviri", profession: "İçerik Yazarı" },
  "SEO İçerik Yazarı": { category: "yazi-ceviri", profession: "İçerik Yazarı" },
  "Video Editörü": { category: "video-animasyon", profession: "Video Editörü" },
  "Eğitmen": { category: "egitim-ders" },
  "Ses Mühendisi": { category: "muzik-ses" },
};

function skillsForTitle(title: string, r: (n: number) => number) {
  const mapping = legacyTitles[title];
  const named = mapping?.profession ?? title;
  const exact = professions.find((profession) => profession.title === named);
  if (exact) return exact.skills;

  if (!mapping) return null; // a title nobody in the catalogue does: leave skills empty
  const inCategory = professions.filter((profession) => profession.categorySlug === mapping.category);
  return inCategory[r(inCategory.length)].skills;
}

/**
 * Fills in age, city, expertise, photo and bio for a demo seller that already exists.
 * Deterministic from the e-mail, like the generated profiles, so re-running rewrites the
 * same details instead of shuffling them.
 */
export function describeShowcaseFreelancer(seller: {
  email: string;
  name: string;
  title: string;
}): ShowcaseProfile {
  // A separate namespace from the generated profiles: fl7 and uzman7 should not end up
  // being the same person in a different shirt.
  const r = reader(hash32(`vitrin:${seller.email}`));

  const age = 22 + Math.min(r(37), r(37));
  const city = pickCity(r);
  const pool = skillsForTitle(seller.title, r);
  const skills = pool ? pickSome(pool, 3 + r(3), r) : [];
  const years = Math.max(1, Math.min(age - 21, 2 + r(13)));
  const firstName = seller.name.split(" ")[0];

  // Several of the bulk sellers share a display name ("Ahmet A." is both fl1 and fl121),
  // so the local part of the address goes into the seed to keep the drawings apart.
  const feminine = looksFeminine(firstName);
  const prefix = feminine === null ? "" : feminine ? "k-" : "e-";
  const handle = seller.email.split("@")[0];

  return {
    email: seller.email,
    age,
    city: city.name,
    skills,
    image: `/api/avatar/${prefix}${slugifyName(seller.name)}-${handle}`,
    bio:
      skills.length >= 2
        ? buildBio(firstName, seller.title, years, city, skills, r)
        : `${city.locative} yaşayan bir ${seller.title}. ${years} yıldır Profestia'da hizmet veriyorum.`,
  };
}

/** ASCII form of a name, used to keep avatar URLs readable and path-safe. */
function slugifyName(name: string) {
  return name
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
