import { categoryEmoji } from "@/components/category-icon";

/**
 * Emoji for a subcategory, matched on its name.
 *
 * Kept out of the database on purpose. A column would mean a migration now, an admin
 * field to fill in, and a blank icon for every subcategory nobody remembered to set.
 * Matching on the name gives all sixty of them an icon today, and anything added later
 * falls back to its parent category's emoji rather than showing nothing.
 */
const byName: Record<string, string> = {
  // AI & Otomasyon
  "AI Asistan & İçerik Üretimi": "🪄",
  "AI Danışmanlığı & Raporlama": "📑",
  "AI Entegrasyonları": "🔗",
  "Chatbot Geliştirme": "💬",
  "Veri & CRM Otomasyonu": "🗂️",
  "İş Akışı Otomasyonu (Zapier/Make/n8n)": "🔁",

  // Yazılım & Web
  "API & Entegrasyon": "🔌",
  "E-ticaret Geliştirme": "🛒",
  "Mobil Uygulama Geliştirme": "📱",
  "Teknik SEO & Performans": "⚡",
  "Web Sitesi Geliştirme": "🌐",
  "Özel Yazılım & Panel": "🎛️",

  // Grafik Tasarım
  "Baskı & Ambalaj Tasarımı": "📦",
  "Kurumsal Kimlik": "🏷️",
  "Logo Tasarımı": "🖋️",
  "Sosyal Medya Tasarımları": "📱",
  "Sunum Tasarımı": "📊",
  "İkon & İllüstrasyon": "🖍️",

  // Dijital Pazarlama
  "Arama Motoru Reklamcılığı (SEM)": "🔍",
  "E-posta & Dönüşüm Pazarlama": "📧",
  "Marka Stratejisi": "🧭",
  "SEO & İçerik Pazarlama": "📈",
  "Sosyal Medya Reklamcılığı": "📣",
  "Sosyal Medya Yönetimi": "📲",

  // Veri & Analitik
  "Dashboard & Raporlama (Power BI/Excel)": "📊",
  "Finansal & Envanter Analizi": "💰",
  "Müşteri & Test Analizi": "🧪",
  "Satış & Pazarlama Analitiği": "📈",
  "Veritabanı & SQL Analizi": "🗄️",
  "Web & Trafik Analitiği": "🔎",

  // İş & Danışmanlık
  "Pazarlama & Marka Danışmanlığı": "🧭",
  "Satış & E-ticaret Danışmanlığı": "🛒",
  "Startup & Yatırımcı Danışmanlığı": "🚀",
  "Süreç & Proje Yönetimi": "📋",
  "İK & Kurumsal Eğitim": "🤝",
  "İş Planı & Finansal Danışmanlık": "💰",

  // Yazı & Çeviri
  "Kariyer Metinleri": "📄",
  "Kurumsal & Akademik Metin": "🎓",
  "Sosyal Medya & Senaryo": "🎭",
  "Çeviri Hizmetleri": "🌍",
  "Ürün & Web Metni": "🏷️",
  "İçerik & Blog Yazarlığı": "✍️",

  // Video & Animasyon
  "Etkinlik & Düğün Videosu": "💍",
  "Eğitim & Podcast Videosu": "🎙️",
  "Kurumsal & Reklam Filmi": "🎬",
  "Logo & Motion Animasyon": "🎞️",
  "Sosyal Medya Video Kurgu": "✂️",
  "Ürün & Tanıtım Videosu": "🎥",

  // Eğitim & Ders
  "Akademik Dersler": "📚",
  "Dil Eğitimi": "🌍",
  "Kişisel Gelişim & Kariyer Koçluğu": "🌱",
  "Sanat & Hobi Dersleri": "🎨",
  "Tasarım & Dijital Beceri Eğitimi": "🖌️",
  "Yazılım & Ofis Eğitimi": "💻",

  // Müzik & Ses
  "Müzik Besteleme & Beat": "🎼",
  "Podcast Prodüksiyonu": "🎙️",
  "Reklam & Jingle": "🔔",
  "Ses Efektleri & Mix": "🎚️",
  Seslendirme: "🗣️",
  "Video & Sunum Müziği": "🎵",
};

/** Falls back to the parent category's emoji so a new subcategory is never iconless. */
export function subcategoryEmoji(name: string, categoryIcon: string) {
  return byName[name] ?? categoryEmoji(categoryIcon);
}
