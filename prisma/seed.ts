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
];

const sellers = [
  { name: "Elif K.", email: "elif@profestia.dev", title: "Sosyal Medya Uzmanı" },
  { name: "Mert A.", email: "mert@profestia.dev", title: "Full Stack Geliştirici" },
  { name: "Aslı T.", email: "asli@profestia.dev", title: "SEO İçerik Yazarı" },
  { name: "Can Y.", email: "can@profestia.dev", title: "Logo & Marka Tasarımcısı" },
  { name: "Zeynep B.", email: "zeynep@profestia.dev", title: "Video Editörü" },
  { name: "Burak S.", email: "burak@profestia.dev", title: "Reklam Yöneticisi" },
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
