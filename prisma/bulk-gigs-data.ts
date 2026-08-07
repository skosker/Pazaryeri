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
  subjects: string[];
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
    subjects: [
      "Minimalist logonuzu",
      "Kurumsal kimlik paketinizi",
      "Sosyal medya kapak görselinizi",
      "Ambalaj tasarımınızı",
      "Broşür ve katalog tasarımınızı",
      "İnfografiğinizi",
      "Instagram post şablonunuzu",
      "Kartvizit tasarımınızı",
      "El ilanı (flyer) tasarımınızı",
      "Sunum (PowerPoint) tasarımınızı",
      "İkon setinizi",
      "Banner ve afiş tasarımınızı",
    ],
    priceMin: 150,
    priceMax: 900,
    deliveryMin: 1,
    deliveryMax: 5,
    coverColors: ["amber", "rose", "violet"],
  },
  {
    slug: "yazilim-web",
    sellerTitle: "Yazılım Geliştirici",
    verbs: ["geliştiriyorum", "kuruyorum", "entegre ediyorum", "optimize ediyorum"],
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
    priceMin: 400,
    priceMax: 2500,
    deliveryMin: 3,
    deliveryMax: 14,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "yazi-ceviri",
    sellerTitle: "İçerik Yazarı",
    verbs: ["yazıyorum", "hazırlıyorum", "düzenliyorum", "çeviriyorum"],
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
    priceMin: 120,
    priceMax: 500,
    deliveryMin: 1,
    deliveryMax: 4,
    coverColors: ["violet", "amber"],
  },
  {
    slug: "video-animasyon",
    sellerTitle: "Video Editörü",
    verbs: ["kurguluyorum", "hazırlıyorum", "canlandırıyorum", "düzenliyorum"],
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
    priceMin: 250,
    priceMax: 1200,
    deliveryMin: 2,
    deliveryMax: 7,
    coverColors: ["emerald", "rose"],
  },
  {
    slug: "dijital-pazarlama",
    sellerTitle: "Dijital Pazarlama Uzmanı",
    verbs: ["yönetiyorum", "kuruyorum", "optimize ediyorum", "planlıyorum"],
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
    priceMin: 300,
    priceMax: 1500,
    deliveryMin: 3,
    deliveryMax: 10,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "muzik-ses",
    sellerTitle: "Ses Mühendisi",
    verbs: ["kaydediyorum", "düzenliyorum", "besteliyorum", "mikslıyorum"],
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
    priceMin: 100,
    priceMax: 600,
    deliveryMin: 1,
    deliveryMax: 5,
    coverColors: ["indigo", "rose"],
  },
  {
    slug: "is-danismanlik",
    sellerTitle: "İş Danışmanı",
    verbs: ["veriyorum", "hazırlıyorum", "yönetiyorum", "kuruyorum"],
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
    priceMin: 350,
    priceMax: 2000,
    deliveryMin: 2,
    deliveryMax: 10,
    coverColors: ["amber", "emerald"],
  },
  {
    slug: "egitim-ders",
    sellerTitle: "Eğitmen",
    verbs: ["veriyorum", "hazırlıyorum", "anlatıyorum", "planlıyorum"],
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
    priceMin: 150,
    priceMax: 700,
    deliveryMin: 1,
    deliveryMax: 3,
    coverColors: ["violet", "amber"],
  },
  {
    slug: "ai-otomasyon",
    sellerTitle: "AI & Otomasyon Danışmanı",
    verbs: ["kuruyorum", "geliştiriyorum", "entegre ediyorum", "otomatikleştiriyorum"],
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
    priceMin: 500,
    priceMax: 3000,
    deliveryMin: 3,
    deliveryMax: 14,
    coverColors: ["sky", "indigo"],
  },
  {
    slug: "veri-analitik",
    sellerTitle: "Veri Analisti",
    verbs: ["hazırlıyorum", "kuruyorum", "analiz ediyorum", "raporluyorum"],
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
    priceMin: 400,
    priceMax: 1800,
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
export type BulkGig = {
  sellerEmail: string;
  categorySlug: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  delivery: number;
  coverColor: string;
};

export const GIGS_PER_CATEGORY_GENERATED = 48;
const SELLERS_PER_CATEGORY = 6;

export function generateBulkData(): { sellers: BulkSeller[]; gigs: BulkGig[] } {
  const sellers: BulkSeller[] = [];
  const gigs: BulkGig[] = [];
  const usedSlugs = new Set<string>();
  let sellerCounter = 0;

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

    for (let i = 0; i < GIGS_PER_CATEGORY_GENERATED; i++) {
      const subject = cat.subjects[i % cat.subjects.length];
      const verb = cat.verbs[Math.floor(i / cat.subjects.length) % cat.verbs.length];
      const title = `${subject} ${verb}`;

      let slug = slugify(title);
      let attempt = 1;
      while (usedSlugs.has(slug)) {
        attempt++;
        slug = `${slugify(title)}-${attempt}`;
      }
      usedSlugs.add(slug);

      const seller = catSellers[i % catSellers.length];
      const h = hash(slug);

      const priceRange = cat.priceMax - cat.priceMin;
      const price = Math.round((cat.priceMin + (h % priceRange)) / 50) * 50;

      const deliveryRange = cat.deliveryMax - cat.deliveryMin + 1;
      const delivery = cat.deliveryMin + ((h >> 8) % deliveryRange);

      const coverColor = cat.coverColors[i % cat.coverColors.length];
      const description = descriptionTemplates[h % descriptionTemplates.length];

      gigs.push({
        sellerEmail: seller.email,
        categorySlug: cat.slug,
        title,
        slug,
        description,
        price,
        delivery,
        coverColor,
      });
    }
  }

  return { sellers, gigs };
}
