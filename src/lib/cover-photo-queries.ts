import { slugTokens } from "@/lib/cover-art";

/**
 * The stock-photo search term for a listing, in English because that is what the photo
 * libraries index on.
 *
 * The term comes from the words in the gig's own slug rather than from its category, so
 * "gitar-dersinizi-veriyorum" searches for a guitar lesson instead of a generic
 * classroom. Listings whose slug matches nothing fall back to the category's term.
 *
 * Patterns are matched at a hyphen boundary, in order, first match wins — the same rule
 * `coverArt` uses, so the photo and the fallback artwork always describe the same thing.
 */
const topicQueries: [string, string][] = [
  // Compounds first, so they beat the single words further down.
  ["fon-muzi", "background music studio"],
  ["ses-efekt", "sound design studio"],
  ["ses-kayit", "recording studio microphone"],
  ["ses-tasarim", "sound design studio"],
  ["performans-rapor", "business report documents"],

  // Tasarım
  ["logo", "logo design sketch"],
  ["kurumsal-kimli", "brand identity design"],
  ["marka", "brand identity design"],
  ["infografi", "infographic chart design"],
  ["brosur", "brochure print design"],
  ["katalog", "product catalog print"],
  ["el-ilani", "flyer print design"],
  ["flyer", "flyer print design"],
  ["ambalaj", "packaging design box"],
  ["illustrasyon", "illustration artist drawing"],
  ["karakter", "character illustration artist"],
  ["ikon", "icon design workspace"],
  ["ciz", "illustrator drawing tablet"],
  ["banner", "poster banner design"],
  ["afis", "poster design wall"],
  ["kartvizit", "business card design"],
  ["sablon", "design template layout"],

  // Sunum & doküman
  ["pitch-deck", "business presentation slides"],
  ["sunum", "business presentation slides"],
  ["cv", "resume cv document"],
  ["ozgecmis", "resume cv document"],

  // Yazılım
  ["wordpress", "web design website"],
  ["web-sitesi", "web design website"],
  ["landing", "landing page web design"],
  ["mobil-uygulama", "mobile app development"],
  ["android", "mobile app development"],
  ["oyun", "game development"],
  ["eklenti", "browser software code"],
  ["chrome", "browser software code"],
  ["odeme", "online payment card"],
  ["panel", "admin dashboard screen"],
  ["api", "api code integration"],
  ["entegrasyon", "software integration code"],
  ["veritabani", "database server code"],
  ["sql", "database query code"],
  ["sunucu", "server room datacenter"],
  ["guvenli", "cyber security laptop"],
  ["performans", "website speed performance"],
  ["hiz", "website speed performance"],
  ["seo", "seo analytics laptop"],
  ["e-ticaret", "ecommerce online shopping"],
  ["magaza", "ecommerce online store"],
  ["hata", "debugging code screen"],
  ["test", "software testing laptop"],
  ["bakim", "computer maintenance repair"],

  // AI & otomasyon
  ["yapay-zeka", "artificial intelligence technology"],
  ["chatbot", "chatbot conversation ai"],
  ["otomasyon", "workflow automation technology"],
  ["veri-girisi", "data entry typing"],
  ["tahmin", "forecasting analytics chart"],

  // Veri
  ["dashboard", "data dashboard charts"],
  ["excel", "spreadsheet laptop work"],
  ["kpi", "business kpi report"],
  ["segmentasyon", "customer data analysis"],
  ["model", "data modeling analytics"],
  ["trafik", "web traffic analytics"],
  ["gorsellestir", "data visualization charts"],
  ["rapor", "business report documents"],
  ["analiz", "data analysis charts"],
  ["envanter", "inventory warehouse management"],

  // Yazı & çeviri
  ["ceviri", "translation language dictionary"],
  ["ingilizce", "english language learning"],
  ["almanca", "language learning books"],
  ["makale", "writing blog laptop"],
  ["blog", "writing blog laptop"],
  ["senaryo", "screenplay script writing"],
  ["diyalog", "conversation dialogue writing"],
  ["kitap", "book publishing desk"],
  ["hikaye", "storytelling book reading"],
  ["metin", "content writing desk"],
  ["iceri", "content writing desk"],
  ["urun-aciklama", "product description ecommerce"],

  // Video
  ["dugun", "wedding videography camera"],
  ["podcast", "podcast recording studio"],
  ["animasyon", "animation motion design"],
  ["canlandir", "animation motion design"],
  ["kurgu", "video editing timeline"],
  ["montaj", "video editing timeline"],
  ["altyazi", "video editing subtitles"],
  ["tanitim-video", "product video shooting"],

  // Pazarlama
  ["reklam", "advertising campaign marketing"],
  ["google-ads", "search advertising laptop"],
  ["instagram", "social media phone"],
  ["sosyal-medya", "social media content phone"],
  ["e-posta", "email marketing laptop"],
  ["huni", "sales funnel marketing"],
  ["influencer", "influencer content creator"],

  // Müzik & ses
  ["seslendir", "voice over microphone"],
  ["spot", "radio broadcast microphone"],
  ["jingle", "music production studio"],
  ["beste", "songwriting composer piano"],
  ["sarki", "singer recording studio"],
  ["mix", "audio mixing console"],
  ["master", "audio mixing console"],
  ["muzi", "music production studio"],

  // İş
  ["startup", "startup team office"],
  ["is-plani", "business plan document"],
  ["muhasebe", "accounting bookkeeping desk"],
  ["finans", "finance budget calculator"],
  ["butce", "finance budget calculator"],
  ["sozlesme", "legal contract signing"],
  ["huku", "legal office law"],
  ["danismanli", "business consulting meeting"],

  // Eğitim
  ["gitar", "guitar lesson"],
  ["piyano", "piano lesson"],
  ["yoga", "yoga class"],
  ["fotograf", "photography camera"],
  ["matemati", "mathematics teaching board"],
  ["sinav", "exam study preparation"],
  ["tez", "thesis research study"],
  ["koclu", "life coaching session"],
  ["kisisel-gelisim", "personal development coaching"],
  ["kariyer", "career coaching interview"],
  ["ders", "online lesson teacher"],
  ["egitim", "online learning study"],
];

/** Keyed by Category.icon, used when the slug matches no topic above. */
const categoryQueries: Record<string, string> = {
  cpu: "artificial intelligence technology",
  code: "software developer workspace",
  palette: "graphic design workspace",
  megaphone: "digital marketing team",
  chart: "data analytics dashboard",
  briefcase: "business consulting meeting",
  pen: "writing desk notebook",
  video: "video production camera",
  book: "online learning study",
  music: "music studio recording",
  sparkles: "creative workspace",
};

export function photoQueryFor(categoryIcon: string, gigSlug: string): string {
  const tokens = slugTokens(gigSlug);
  const topic = topicQueries.find(([pattern]) => tokens.includes(`-${pattern}`));
  return topic ? topic[1] : categoryQueries[categoryIcon] ?? categoryQueries.sparkles;
}
