import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { generateBulkData } from "./bulk-gigs-data";
import { generateSyntheticFreelancers } from "./synthetic-freelancers";
import { DEMO_SELLERS, loadShowcaseOffers, showcaseFreelancers } from "./showcase-freelancers";
import { syncShowcaseFreelancers, syncSyntheticFreelancers } from "./sync-synthetic-freelancers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "AI & Otomasyon", slug: "ai-otomasyon", icon: "cpu", order: 1 },
  { name: "Yazılım & Web", slug: "yazilim-web", icon: "code", order: 2 },
  { name: "Grafik Tasarım", slug: "grafik-tasarim", icon: "palette", order: 3 },
  { name: "Dijital Pazarlama", slug: "dijital-pazarlama", icon: "megaphone", order: 4 },
  { name: "Veri & Analitik", slug: "veri-analitik", icon: "chart", order: 5 },
  { name: "İş & Danışmanlık", slug: "is-danismanlik", icon: "briefcase", order: 6 },
  { name: "Yazı & Çeviri", slug: "yazi-ceviri", icon: "pen", order: 7 },
  { name: "Video & Animasyon", slug: "video-animasyon", icon: "video", order: 8 },
  { name: "Eğitim & Ders", slug: "egitim-ders", icon: "book", order: 9 },
  { name: "Müzik & Ses", slug: "muzik-ses", icon: "music", order: 10 },
];

const gigs = [
  {
    seller: "elif@profestia.dev",
    category: "dijital-pazarlama",
    subcategory: "Sosyal Medya Yönetimi",
    title: "Sosyal medya içerik tasarımı yapıyorum",
    coverColor: "rose",
    price: 2100,
    delivery: 3,
    description:
      "Instagram, Facebook ve LinkedIn hesabınız için markanıza özel, dikkat çekici sosyal medya içerikleri tasarlıyorum. Kaynak dosyalar ve 2 revizyon dahildir.",
  },
  {
    seller: "mert@profestia.dev",
    category: "yazilim-web",
    subcategory: "Web Sitesi Geliştirme",
    title: "Kurumsal web siteniz için ön yüz geliştiriyorum",
    coverColor: "sky",
    price: 8400,
    delivery: 7,
    description:
      "Next.js ve Tailwind CSS ile hızlı, mobil uyumlu ve SEO dostu kurumsal web siteleri geliştiriyorum. Modern, temiz ve sürdürülebilir kod.",
  },
  {
    seller: "asli@profestia.dev",
    category: "yazi-ceviri",
    subcategory: "İçerik & Blog Yazarlığı",
    title: "SEO uyumlu blog yazıları ve içerik üretiyorum",
    coverColor: "violet",
    price: 800,
    delivery: 2,
    description:
      "Anahtar kelime araştırması yaparak Google'da üst sıralarda yer almanızı sağlayacak, akıcı ve özgün blog içerikleri yazıyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "grafik-tasarim",
    subcategory: "Kurumsal Kimlik",
    title: "Profesyonel logo ve marka kimliği tasarlıyorum",
    coverColor: "amber",
    price: 3250,
    delivery: 4,
    description:
      "Markanızı yansıtan özgün logo tasarımı, renk paleti ve tipografi ile eksiksiz bir marka kimliği paketi hazırlıyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "video-animasyon",
    subcategory: "Sosyal Medya Video Kurgu",
    title: "Youtube ve reels için video kurgusu yapıyorum",
    coverColor: "emerald",
    price: 2300,
    delivery: 3,
    description:
      "Ham çekimlerinizi profesyonel geçişler, altyazı ve renk düzenlemesiyle akıcı bir kurguya dönüştürüyorum.",
  },
  {
    seller: "burak@profestia.dev",
    category: "dijital-pazarlama",
    subcategory: "Sosyal Medya Reklamcılığı",
    title: "Google & Meta reklam kampanyanızı yönetiyorum",
    coverColor: "indigo",
    price: 5400,
    delivery: 5,
    description:
      "Bütçenizi verimli kullanarak dönüşüm odaklı Google Ads ve Meta Ads kampanyaları kurup optimize ediyorum.",
  },
  {
    seller: "mert@profestia.dev",
    category: "yazilim-web",
    subcategory: "E-ticaret Geliştirme",
    title: "E-ticaret siteniz için ödeme entegrasyonu yapıyorum",
    coverColor: "sky",
    price: 10500,
    delivery: 6,
    description:
      "iyzico, Stripe veya PayPal ile güvenli ödeme altyapısını sitenize sorunsuz şekilde entegre ediyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "grafik-tasarim",
    subcategory: "Sosyal Medya Tasarımları",
    title: "Ürün kataloğunuz için sosyal medya postu tasarlıyorum",
    coverColor: "amber",
    price: 1250,
    delivery: 2,
    description:
      "Ürünlerinizi öne çıkaran, satış odaklı görsel post ve story tasarımları hazırlıyorum.",
  },
  {
    seller: "asli@profestia.dev",
    category: "yazi-ceviri",
    subcategory: "Çeviri Hizmetleri",
    title: "İngilizce-Türkçe profesyonel çeviri yapıyorum",
    coverColor: "violet",
    price: 1000,
    delivery: 2,
    description:
      "Teknik dokümanlar, web siteleri ve pazarlama metinlerinizi anlam bütünlüğünü koruyarak İngilizce-Türkçe çeviriyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "video-animasyon",
    subcategory: "Logo & Motion Animasyon",
    title: "2D logo animasyonu ve marka intro'su hazırlıyorum",
    coverColor: "emerald",
    price: 3000,
    delivery: 4,
    description:
      "Markanızın logosunu akıcı bir 2D animasyona dönüştürüp video içeriklerinizin başına eklenecek profesyonel bir intro hazırlıyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "muzik-ses",
    subcategory: "Podcast Prodüksiyonu",
    title: "Podcast ve video için ses miksajı ve düzenleme yapıyorum",
    coverColor: "indigo",
    price: 1500,
    delivery: 3,
    description:
      "Ham ses kayıtlarınızı gürültüden arındırıp seviye dengelemesi yaparak yayına hazır, temiz bir mikse dönüştürüyorum.",
  },
  {
    seller: "elif@profestia.dev",
    category: "muzik-ses",
    subcategory: "Video & Sunum Müziği",
    title: "Sosyal medya videolarınız için müzik ve seslendirme buluyorum",
    coverColor: "rose",
    price: 900,
    delivery: 2,
    description:
      "İçeriğinizin tonuna uygun telifsiz müzik seçimi yapıyor, gerektiğinde kısa seslendirme kaydı da sağlıyorum.",
  },
  {
    seller: "burak@profestia.dev",
    category: "is-danismanlik",
    subcategory: "Pazarlama & Marka Danışmanlığı",
    title: "Küçük işletmeler için pazarlama stratejisi danışmanlığı veriyorum",
    coverColor: "amber",
    price: 4900,
    delivery: 5,
    description:
      "İşletmenizin hedef kitlesini, rakiplerini ve kanallarını analiz ederek uygulanabilir bir pazarlama yol haritası çıkarıyorum.",
  },
  {
    seller: "mert@profestia.dev",
    category: "is-danismanlik",
    subcategory: "Süreç & Proje Yönetimi",
    title: "Yazılım projeniz için teknik danışmanlık ve kod incelemesi yapıyorum",
    coverColor: "sky",
    price: 3900,
    delivery: 3,
    description:
      "Mevcut kod tabanınızı inceleyip mimari, performans ve güvenlik açısından somut iyileştirme önerileri sunuyorum.",
  },
  {
    seller: "asli@profestia.dev",
    category: "egitim-ders",
    subcategory: "Tasarım & Dijital Beceri Eğitimi",
    title: "İçerik yazarlığı ve SEO üzerine birebir online ders veriyorum",
    coverColor: "violet",
    price: 1800,
    delivery: 1,
    description:
      "SEO uyumlu içerik yazımının temellerini, anahtar kelime araştırmasını ve yazı planlamasını birebir canlı derste anlatıyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "egitim-ders",
    subcategory: "Tasarım & Dijital Beceri Eğitimi",
    title: "Grafik tasarım temelleri online eğitimi veriyorum",
    coverColor: "amber",
    price: 2000,
    delivery: 1,
    description:
      "Tipografi, renk teorisi ve kompozisyon temellerini örneklerle anlatan, yeni başlayanlara yönelik birebir eğitim veriyorum.",
  },
  {
    seller: "deniz@profestia.dev",
    category: "ai-otomasyon",
    subcategory: "İş Akışı Otomasyonu (Zapier/Make/n8n)",
    title: "Zapier & Make ile iş süreçlerinizi otomatikleştiriyorum",
    coverColor: "indigo",
    price: 6400,
    delivery: 5,
    description:
      "Tekrar eden manuel işlerinizi Zapier veya Make üzerinde kurduğum otomasyon akışlarıyla ortadan kaldırıyorum.",
  },
  {
    seller: "deniz@profestia.dev",
    category: "ai-otomasyon",
    subcategory: "Chatbot Geliştirme",
    title: "ChatGPT/Claude entegrasyonlu AI chatbot geliştiriyorum",
    coverColor: "sky",
    price: 10500,
    delivery: 8,
    description:
      "Web siteniz veya WhatsApp hattınız için müşteri sorularını yanıtlayan, kendi verilerinizle eğitilmiş bir AI chatbot geliştiriyorum.",
  },
  {
    seller: "ayse@profestia.dev",
    category: "veri-analitik",
    subcategory: "Satış & Pazarlama Analitiği",
    title: "İşletmeniz için satış ve pazarlama verilerini analiz ediyorum",
    coverColor: "emerald",
    price: 4900,
    delivery: 4,
    description:
      "Ham verilerinizi düzenleyip anlamlı içgörülere dönüştürerek karar alma sürecinize somut veri desteği sağlıyorum.",
  },
  {
    seller: "ayse@profestia.dev",
    category: "veri-analitik",
    subcategory: "Dashboard & Raporlama (Power BI/Excel)",
    title: "Excel/Power BI ile interaktif veri paneli (dashboard) hazırlıyorum",
    coverColor: "violet",
    price: 6650,
    delivery: 6,
    description:
      "Verilerinizi canlı güncellenen, filtrelenebilir bir Power BI veya Excel panelinde tek bakışta takip edilebilir hale getiriyorum.",
  },
];

/**
 * Every gig gets the same three-tier ladder derived from its base (Standart) price:
 * Temel ~60% price and a day slower, Premium ~180% price and a day faster.
 * Upserting per tier means re-running the seed re-prices existing rows instead of
 * leaving a stale ladder behind.
 */
async function seedPackageLadder(gigId: string, basePrice: number, baseDelivery: number) {
  const tiers = [
    {
      tier: "BASIC" as const,
      name: "Temel Paket",
      description: "İhtiyacın olan temel çalışma. Tek konsept, sade teslimat.",
      price: Math.round((basePrice * 0.6) / 50) * 50,
      deliveryDays: baseDelivery + 1,
      revisionCount: 1,
      features: ["Temel kapsam", "1 revizyon hakkı", "Standart teslim"],
    },
    {
      tier: "STANDARD" as const,
      name: "Standart Paket",
      description: "Temel içerik paketi, 2 revizyon ve kaynak dosyalar dahil.",
      price: basePrice,
      deliveryDays: baseDelivery,
      revisionCount: 2,
      features: ["Kaynak dosyalar dahil", "2 revizyon hakkı", "Ticari kullanım lisansı"],
    },
    {
      tier: "PREMIUM" as const,
      name: "Premium Paket",
      description: "Geniş kapsam, tüm kaynak dosyalar ve öncelikli teslimat.",
      price: Math.round((basePrice * 1.8) / 50) * 50,
      deliveryDays: Math.max(1, baseDelivery - 1),
      revisionCount: 4,
      features: [
        "Kaynak dosyalar dahil",
        "Ticari kullanım lisansı",
        "Öncelikli teslimat",
        "4 revizyon hakkı",
      ],
    },
  ];

  for (const t of tiers) {
    const existing = await prisma.package.findFirst({ where: { gigId, tier: t.tier } });
    if (existing) {
      await prisma.package.update({ where: { id: existing.id }, data: t });
    } else {
      await prisma.package.create({ data: { ...t, gigId } });
    }
  }
}


async function main() {
  console.log("Seeding...");

  const password = await bcrypt.hash("password123", 10);
  const { sellers: bulkSellers, subcategories: bulkSubcategories, gigs: bulkGigs } = generateBulkData();

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { order: c.order },
      create: c,
    });
  }

  const subcategoryBySlugAndName = new Map<string, string>();
  for (const sc of bulkSubcategories) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: sc.categorySlug } });
    await prisma.subcategory.upsert({
      where: { slug: sc.slug },
      update: {},
      create: { name: sc.name, slug: sc.slug, categoryId: category.id },
    });
    subcategoryBySlugAndName.set(`${sc.categorySlug}::${sc.name}`, sc.slug);
  }

  for (const s of DEMO_SELLERS) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        title: s.title,
        role: "FREELANCER",
        passwordHash: password,
        emailVerified: new Date(),
        bio: `${s.title} olarak ${s.name.split(" ")[0]}, Prosinta'da yıllardır profesyonel hizmet veriyor.`,
      },
    });
  }

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@profestia.dev" },
    update: {},
    create: {
      name: "Demo Alıcı",
      email: "buyer@profestia.dev",
      role: "BUYER",
      passwordHash: password,
      emailVerified: new Date(),
    },
  });
  void buyer;

  for (const g of gigs) {
    const seller = await prisma.user.findUniqueOrThrow({
      where: { email: g.seller },
    });
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: g.category },
    });
    const subcategorySlug = subcategoryBySlugAndName.get(`${g.category}::${g.subcategory}`);
    const slug = g.title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const subcategoryId = subcategorySlug
      ? (await prisma.subcategory.findUniqueOrThrow({ where: { slug: subcategorySlug } })).id
      : null;

    const gig = await prisma.gig.upsert({
      where: { slug },
      update: { subcategoryId },
      create: {
        slug,
        title: g.title,
        description: g.description,
        coverColor: g.coverColor,
        sellerId: seller.id,
        categoryId: category.id,
        subcategoryId,
      },
    });

    await seedPackageLadder(gig.id, g.price, g.delivery);
  }

  console.log("Seeding bulk listings (50 per category)...");

  for (const s of bulkSellers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        title: s.title,
        role: "FREELANCER",
        passwordHash: password,
        emailVerified: new Date(),
        bio: `${s.title} olarak ${s.name.split(" ")[0]}, Prosinta'da profesyonel hizmet veriyor.`,
      },
    });
  }

  for (const g of bulkGigs) {
    const seller = await prisma.user.findUniqueOrThrow({ where: { email: g.sellerEmail } });
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: g.categorySlug } });
    const subcategory = await prisma.subcategory.findUniqueOrThrow({ where: { slug: g.subcategorySlug } });

    const gig = await prisma.gig.upsert({
      where: { slug: g.slug },
      update: { subcategoryId: subcategory.id },
      create: {
        slug: g.slug,
        title: g.title,
        description: g.description,
        coverColor: g.coverColor,
        sellerId: seller.id,
        categoryId: category.id,
        subcategoryId: subcategory.id,
      },
    });

    await seedPackageLadder(gig.id, g.price, g.delivery);
  }

  console.log("Seeding synthetic freelancer profiles...");

  const synthetic = await syncSyntheticFreelancers(prisma, generateSyntheticFreelancers());
  console.log(
    `  ${synthetic.created} created, ${synthetic.updated} refreshed` +
      (synthetic.skipped.length > 0 ? `, ${synthetic.skipped.length} real accounts left alone` : "")
  );

  // Loaded after the listings above are in place, so the expertise on each showcase
  // profile is what that seller actually lists.
  const offers = await loadShowcaseOffers(prisma);
  const showcase = await syncShowcaseFreelancers(prisma, showcaseFreelancers(offers));
  console.log(`  ${showcase.updated} older demo sellers completed`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
