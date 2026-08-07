import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Grafik Tasarım", slug: "grafik-tasarim", icon: "palette" },
  { name: "Yazılım & Web", slug: "yazilim-web", icon: "code" },
  { name: "Yazı & Çeviri", slug: "yazi-ceviri", icon: "pen" },
  { name: "Video & Animasyon", slug: "video-animasyon", icon: "video" },
  { name: "Dijital Pazarlama", slug: "dijital-pazarlama", icon: "megaphone" },
  { name: "Müzik & Ses", slug: "muzik-ses", icon: "music" },
  { name: "İş & Danışmanlık", slug: "is-danismanlik", icon: "briefcase" },
  { name: "Eğitim & Ders", slug: "egitim-ders", icon: "book" },
  { name: "AI & Otomasyon", slug: "ai-otomasyon", icon: "cpu" },
  { name: "Veri & Analitik", slug: "veri-analitik", icon: "chart" },
];

const sellers = [
  { name: "Elif K.", email: "elif@profestia.dev", title: "Sosyal Medya Uzmanı" },
  { name: "Mert A.", email: "mert@profestia.dev", title: "Full Stack Geliştirici" },
  { name: "Aslı T.", email: "asli@profestia.dev", title: "SEO İçerik Yazarı" },
  { name: "Can Y.", email: "can@profestia.dev", title: "Logo & Marka Tasarımcısı" },
  { name: "Zeynep B.", email: "zeynep@profestia.dev", title: "Video Editörü" },
  { name: "Burak S.", email: "burak@profestia.dev", title: "Reklam Yöneticisi" },
  { name: "Deniz A.", email: "deniz@profestia.dev", title: "AI & Otomasyon Danışmanı" },
  { name: "Ayşe Ö.", email: "ayse@profestia.dev", title: "Veri Analisti" },
];

const gigs = [
  {
    seller: "elif@profestia.dev",
    category: "dijital-pazarlama",
    title: "Sosyal medya içerik tasarımı yapıyorum",
    coverColor: "rose",
    price: 350,
    delivery: 3,
    description:
      "Instagram, Facebook ve LinkedIn hesabınız için markanıza özel, dikkat çekici sosyal medya içerikleri tasarlıyorum. Kaynak dosyalar ve 2 revizyon dahildir.",
  },
  {
    seller: "mert@profestia.dev",
    category: "yazilim-web",
    title: "Kurumsal web siteniz için ön yüz geliştiriyorum",
    coverColor: "sky",
    price: 1200,
    delivery: 7,
    description:
      "Next.js ve Tailwind CSS ile hızlı, mobil uyumlu ve SEO dostu kurumsal web siteleri geliştiriyorum. Modern, temiz ve sürdürülebilir kod.",
  },
  {
    seller: "asli@profestia.dev",
    category: "yazi-ceviri",
    title: "SEO uyumlu blog yazıları ve içerik üretiyorum",
    coverColor: "violet",
    price: 180,
    delivery: 2,
    description:
      "Anahtar kelime araştırması yaparak Google'da üst sıralarda yer almanızı sağlayacak, akıcı ve özgün blog içerikleri yazıyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "grafik-tasarim",
    title: "Profesyonel logo ve marka kimliği tasarlıyorum",
    coverColor: "amber",
    price: 650,
    delivery: 4,
    description:
      "Markanızı yansıtan özgün logo tasarımı, renk paleti ve tipografi ile eksiksiz bir marka kimliği paketi hazırlıyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "video-animasyon",
    title: "Youtube ve reels için video kurgusu yapıyorum",
    coverColor: "emerald",
    price: 420,
    delivery: 3,
    description:
      "Ham çekimlerinizi profesyonel geçişler, altyazı ve renk düzenlemesiyle akıcı bir kurguya dönüştürüyorum.",
  },
  {
    seller: "burak@profestia.dev",
    category: "dijital-pazarlama",
    title: "Google & Meta reklam kampanyanızı yönetiyorum",
    coverColor: "indigo",
    price: 900,
    delivery: 5,
    description:
      "Bütçenizi verimli kullanarak dönüşüm odaklı Google Ads ve Meta Ads kampanyaları kurup optimize ediyorum.",
  },
  {
    seller: "mert@profestia.dev",
    category: "yazilim-web",
    title: "E-ticaret siteniz için ödeme entegrasyonu yapıyorum",
    coverColor: "sky",
    price: 1500,
    delivery: 6,
    description:
      "iyzico, Stripe veya PayPal ile güvenli ödeme altyapısını sitenize sorunsuz şekilde entegre ediyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "grafik-tasarim",
    title: "Ürün kataloğunuz için sosyal medya postu tasarlıyorum",
    coverColor: "amber",
    price: 250,
    delivery: 2,
    description:
      "Ürünlerinizi öne çıkaran, satış odaklı görsel post ve story tasarımları hazırlıyorum.",
  },
  {
    seller: "asli@profestia.dev",
    category: "yazi-ceviri",
    title: "İngilizce-Türkçe profesyonel çeviri yapıyorum",
    coverColor: "violet",
    price: 220,
    delivery: 2,
    description:
      "Teknik dokümanlar, web siteleri ve pazarlama metinlerinizi anlam bütünlüğünü koruyarak İngilizce-Türkçe çeviriyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "video-animasyon",
    title: "2D logo animasyonu ve marka intro'su hazırlıyorum",
    coverColor: "emerald",
    price: 550,
    delivery: 4,
    description:
      "Markanızın logosunu akıcı bir 2D animasyona dönüştürüp video içeriklerinizin başına eklenecek profesyonel bir intro hazırlıyorum.",
  },
  {
    seller: "zeynep@profestia.dev",
    category: "muzik-ses",
    title: "Podcast ve video için ses miksajı ve düzenleme yapıyorum",
    coverColor: "indigo",
    price: 300,
    delivery: 3,
    description:
      "Ham ses kayıtlarınızı gürültüden arındırıp seviye dengelemesi yaparak yayına hazır, temiz bir mikse dönüştürüyorum.",
  },
  {
    seller: "elif@profestia.dev",
    category: "muzik-ses",
    title: "Sosyal medya videolarınız için müzik ve seslendirme buluyorum",
    coverColor: "rose",
    price: 180,
    delivery: 2,
    description:
      "İçeriğinizin tonuna uygun telifsiz müzik seçimi yapıyor, gerektiğinde kısa seslendirme kaydı da sağlıyorum.",
  },
  {
    seller: "burak@profestia.dev",
    category: "is-danismanlik",
    title: "Küçük işletmeler için pazarlama stratejisi danışmanlığı veriyorum",
    coverColor: "amber",
    price: 750,
    delivery: 5,
    description:
      "İşletmenizin hedef kitlesini, rakiplerini ve kanallarını analiz ederek uygulanabilir bir pazarlama yol haritası çıkarıyorum.",
  },
  {
    seller: "mert@profestia.dev",
    category: "is-danismanlik",
    title: "Yazılım projeniz için teknik danışmanlık ve kod incelemesi yapıyorum",
    coverColor: "sky",
    price: 600,
    delivery: 3,
    description:
      "Mevcut kod tabanınızı inceleyip mimari, performans ve güvenlik açısından somut iyileştirme önerileri sunuyorum.",
  },
  {
    seller: "asli@profestia.dev",
    category: "egitim-ders",
    title: "İçerik yazarlığı ve SEO üzerine birebir online ders veriyorum",
    coverColor: "violet",
    price: 400,
    delivery: 1,
    description:
      "SEO uyumlu içerik yazımının temellerini, anahtar kelime araştırmasını ve yazı planlamasını birebir canlı derste anlatıyorum.",
  },
  {
    seller: "can@profestia.dev",
    category: "egitim-ders",
    title: "Grafik tasarım temelleri online eğitimi veriyorum",
    coverColor: "amber",
    price: 450,
    delivery: 1,
    description:
      "Tipografi, renk teorisi ve kompozisyon temellerini örneklerle anlatan, yeni başlayanlara yönelik birebir eğitim veriyorum.",
  },
  {
    seller: "deniz@profestia.dev",
    category: "ai-otomasyon",
    title: "Zapier & Make ile iş süreçlerinizi otomatikleştiriyorum",
    coverColor: "indigo",
    price: 850,
    delivery: 5,
    description:
      "Tekrar eden manuel işlerinizi Zapier veya Make üzerinde kurduğum otomasyon akışlarıyla ortadan kaldırıyorum.",
  },
  {
    seller: "deniz@profestia.dev",
    category: "ai-otomasyon",
    title: "ChatGPT/Claude entegrasyonlu AI chatbot geliştiriyorum",
    coverColor: "sky",
    price: 1400,
    delivery: 8,
    description:
      "Web siteniz veya WhatsApp hattınız için müşteri sorularını yanıtlayan, kendi verilerinizle eğitilmiş bir AI chatbot geliştiriyorum.",
  },
  {
    seller: "ayse@profestia.dev",
    category: "veri-analitik",
    title: "İşletmeniz için satış ve pazarlama verilerini analiz ediyorum",
    coverColor: "emerald",
    price: 700,
    delivery: 4,
    description:
      "Ham verilerinizi düzenleyip anlamlı içgörülere dönüştürerek karar alma sürecinize somut veri desteği sağlıyorum.",
  },
  {
    seller: "ayse@profestia.dev",
    category: "veri-analitik",
    title: "Excel/Power BI ile interaktif veri paneli (dashboard) hazırlıyorum",
    coverColor: "violet",
    price: 950,
    delivery: 6,
    description:
      "Verilerinizi canlı güncellenen, filtrelenebilir bir Power BI veya Excel panelinde tek bakışta takip edilebilir hale getiriyorum.",
  },
];

async function main() {
  console.log("Seeding...");

  const password = await bcrypt.hash("password123", 10);

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  for (const s of sellers) {
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
        bio: `${s.title} olarak ${s.name.split(" ")[0]}, Profestia'da yıllardır profesyonel hizmet veriyor.`,
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

    const gig = await prisma.gig.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: g.title,
        description: g.description,
        coverColor: g.coverColor,
        sellerId: seller.id,
        categoryId: category.id,
      },
    });

    const existingPackage = await prisma.package.findFirst({
      where: { gigId: gig.id },
    });
    if (!existingPackage) {
      await prisma.package.create({
        data: {
          gigId: gig.id,
          tier: "STANDARD",
          name: "Standart Paket",
          description: "Temel içerik paketi, 2 revizyon ve kaynak dosyalar dahil.",
          price: g.price,
          deliveryDays: g.delivery,
          revisionCount: 2,
          features: [
            "Kaynak dosyalar dahil",
            "2 revizyon hakkı",
            "Ticari kullanım lisansı",
          ],
        },
      });
    }
  }

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
