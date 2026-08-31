/**
 * The fallback gig cover, composed per listing when there is no photo to show.
 *
 * Covers are photographs: sellers upload their own, and `scripts/fetch-cover-photos.ts`
 * fills in the rest from a stock library. This module is what renders when neither is
 * there — a listing created a minute ago, a photo run that has not been done yet, or a
 * photo URL that fails to load.
 *
 * It is a deep two-tone gradient, a faint geometric texture over it and an emoji set
 * large in the middle. The gradient, its angle, the texture and the emoji all derive
 * from the gig slug, so no two listings match and nothing is fetched. The emoji is
 * chosen from the words in the slug rather than the category, so a guitar lesson gets a
 * guitar — the same rule `photoQueryFor` uses to pick a search term.
 */

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

/**
 * The slug as hyphen-delimited tokens, so a pattern can be required to start at a word
 * boundary: a plain `includes` finds "api" inside "yapiyorum" and puts a plug socket on
 * a coaching listing. The replace undoes the slugifier splitting a leading "İ" off into
 * its own word, which is why "İnfografik" arrives as "i-nfografigi".
 *
 * Shared with the stock-photo search terms so both read a slug the same way.
 */
export function slugTokens(gigSlug: string) {
  return `-${gigSlug.replace(/(^|-)i-(?=[a-z])/g, "$1i")}-`;
}

/** Deterministic 0..n-1 stream, so each design decision gets its own bits. */
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

/**
 * Emoji per category, keyed by the value stored on Category.icon so the covers follow
 * whatever the admin picked. Several per category: two listings in the same category get
 * a different object on the cover instead of the same picture in another colour.
 */
const glyphs: Record<string, string[]> = {
  // Yazılım & Web
  code: ["💻", "🖥️", "⌨️", "🧑‍💻", "🌐", "📱", "⚙️", "🔧", "🧪", "🔌", "🛠️", "📦", "🧱", "🚀"],
  // Grafik & Tasarım
  palette: ["🎨", "🖌️", "🖍️", "🧑‍🎨", "🖼️", "✏️", "🌈", "📐", "🎭", "🧵", "🖊️", "🪄", "🧿", "📸"],
  // Yazı & Çeviri
  pen: ["✍️", "📝", "📖", "🖋️", "📰", "🔤", "📄", "💬", "📓", "🗒️", "🧾", "📕", "🌍", "🗣️"],
  // Video & Animasyon
  video: ["🎬", "🎥", "📹", "🎞️", "📽️", "🎦", "✂️", "🍿", "🎙️", "📺", "🎚️", "🕹️", "🌀"],
  // Dijital Pazarlama
  megaphone: ["📣", "📢", "🚀", "🎯", "📈", "💡", "🔍", "🏷️", "📊", "⭐", "🧲", "📧", "🛒"],
  // Müzik & Ses
  music: ["🎵", "🎧", "🎤", "🎹", "🎸", "🥁", "🎼", "🔊", "🎻", "🎺", "📻", "🔔", "🗣️"],
  // İş & Danışmanlık
  briefcase: ["💼", "🤝", "📋", "🏢", "📑", "💰", "🗂️", "⚖️", "📊", "🧾", "📈", "🏦", "🧭"],
  // Eğitim & Ders
  book: ["🎓", "📚", "📖", "🧑‍🏫", "🏫", "🧮", "✏️", "🔬", "🧘", "🎸", "🎹", "📝", "🌱"],
  // AI & Otomasyon
  cpu: ["🤖", "🧠", "⚡", "🔗", "🧩", "🛰️", "⚙️", "🪄", "💬", "🔮", "🛠️", "🔁", "🧬"],
  // Veri & Analitik
  chart: ["📊", "📈", "🗄️", "🔢", "📉", "🧮", "🗃️", "🔎", "📐", "🧾", "🗺️", "📋"],
  sparkles: ["✨", "💡", "🌟", "🎯", "🧭", "🪄", "🔥", "🌈"],
};

/**
 * Topic emoji matched against the gig slug, which carries the words of the title
 * ("gitar-dersinizi-...", "dugun-videonuzu-..."). The category tells you the aisle; this
 * tells you the actual job, so a guitar lesson gets a guitar rather than a generic
 * mortarboard. First match wins, so the more specific patterns come first. Slugs are
 * ASCII-folded, hence "cizim" and "dugun" without their Turkish diacritics.
 */
const topics: [string, string[]][] = [
  // Compounds first, so "sunum videonuzun fon müziğini" is not read as a presentation.
  ["fon-muzi", ["🎵"]],
  ["ses-efekt", ["🔊"]],
  ["ses-kayit", ["🎚️"]],
  ["ses-tasarim", ["🔊"]],
  ["performans-rapor", ["📑"]],
  // Tasarım
  ["logo", ["🖋️", "✒️"]],
  ["kurumsal-kimli", ["🏷️"]],
  ["marka", ["🏷️", "🧭"]],
  ["infografi", ["📈", "🗺️"]],
  ["brosur", ["📄"]],
  ["katalog", ["📒"]],
  ["el-ilani", ["📄"]],
  ["flyer", ["📄"]],
  ["ambalaj", ["📦"]],
  ["illustrasyon", ["🖍️"]],
  ["karakter", ["🧑‍🎨"]],
  ["ikon", ["🔣"]],
  ["ciz", ["🖍️", "✏️"]],
  ["banner", ["🖼️"]],
  ["afis", ["🖼️"]],
  ["kartvizit", ["💳"]],
  ["sablon", ["🧾", "🗂️"]],
  // Sunum & doküman
  ["pitch-deck", ["📊"]],
  ["sunum", ["📊", "🗣️"]],
  ["cv", ["📄"]],
  ["ozgecmis", ["📄"]],
  // Yazılım
  ["wordpress", ["🌐", "🧱"]],
  ["web-sitesi", ["🌐", "🖥️", "🧭"]],
  ["landing", ["🌐", "🧲"]],
  ["mobil-uygulama", ["📱"]],
  ["android", ["📱"]],
  ["oyun", ["🎮"]],
  ["eklenti", ["🧩"]],
  ["chrome", ["🧩"]],
  ["odeme", ["💳"]],
  ["panel", ["🎛️"]],
  ["api", ["🔌"]],
  ["entegrasyon", ["🔌", "🔗"]],
  ["veritabani", ["🗄️"]],
  ["sql", ["🗄️"]],
  ["sunucu", ["🗄️", "🖥️"]],
  ["guvenli", ["🔒"]],
  ["performans", ["⚡"]],
  ["hiz", ["⚡"]],
  ["seo", ["🔍", "📈"]],
  ["e-ticaret", ["🛒"]],
  ["magaza", ["🛒"]],
  ["hata", ["🐞"]],
  ["test", ["🧪"]],
  ["bakim", ["🔧"]],
  // AI & otomasyon
  ["yapay-zeka", ["🤖", "🧠", "🪄"]],
  ["prompt", ["🪄", "💬", "🧠"]],
  ["chatbot", ["💬", "🤖"]],
  ["otomasyon", ["⚙️", "🤖", "🔁", "🛠️"]],
  ["veri-girisi", ["⌨️"]],
  ["tahmin", ["🔮"]],
  // Veri
  ["dashboard", ["📊"]],
  ["excel", ["📊"]],
  ["kpi", ["🎯"]],
  ["segmentasyon", ["🧩"]],
  ["model", ["🧠"]],
  ["trafik", ["🔎"]],
  ["gorsellestir", ["📊"]],
  ["rapor", ["📑", "🗒️"]],
  ["analiz", ["📈", "🔎", "📊"]],
  ["envanter", ["🗃️"]],
  // Yazı & çeviri
  ["ceviri", ["🌍", "🔤", "🗺️", "💬"]],
  ["ingilizce", ["🌍"]],
  ["almanca", ["🌍"]],
  ["makale", ["✍️"]],
  ["blog", ["✍️"]],
  ["senaryo", ["🎭"]],
  ["diyalog", ["💬"]],
  ["kitap", ["📕"]],
  ["hikaye", ["📖"]],
  ["metin", ["📝"]],
  ["iceri", ["📝"]],
  ["urun-aciklama", ["🏷️"]],
  // Video
  ["dugun", ["💍"]],
  ["podcast", ["🎙️"]],
  ["animasyon", ["🎞️"]],
  ["canlandir", ["🎞️"]],
  ["kurgu", ["✂️", "🎬"]],
  ["montaj", ["✂️"]],
  ["altyazi", ["💬"]],
  ["tanitim-video", ["🎥"]],
  // Pazarlama
  ["reklam", ["📣", "📺", "🎯"]],
  ["google-ads", ["🔍"]],
  ["instagram", ["📱"]],
  ["sosyal-medya", ["📱", "📣"]],
  ["e-posta", ["📧"]],
  ["huni", ["📈"]],
  ["influencer", ["⭐"]],
  // Müzik & ses
  ["seslendir", ["🎙️", "🗣️", "📻"]],
  ["spot", ["🎙️"]],
  ["jingle", ["🔔"]],
  ["beste", ["🎼"]],
  ["sarki", ["🎼"]],
  ["mix", ["🎚️"]],
  ["master", ["🎚️"]],
  ["podcast-ses", ["🎧"]],
  ["muzi", ["🎵"]],
  // İş
  ["startup", ["🚀"]],
  ["is-plani", ["📋"]],
  ["muhasebe", ["🧾"]],
  ["finans", ["💰"]],
  ["butce", ["💰"]],
  ["sozlesme", ["⚖️"]],
  ["huku", ["⚖️"]],
  ["danismanli", ["🤝", "💼"]],
  // Eğitim
  ["gitar", ["🎸"]],
  ["piyano", ["🎹"]],
  ["yoga", ["🧘"]],
  ["fotograf", ["📷"]],
  ["matemati", ["🧮"]],
  ["sinav", ["📝"]],
  ["tez", ["📚"]],
  ["koclu", ["🌱"]],
  ["kisisel-gelisim", ["🌱"]],
  ["kariyer", ["🧭"]],
  ["ders", ["🎓", "📚", "🧑‍🏫"]],
  ["egitim", ["🎓", "🏫", "📚"]],
];

/**
 * Texture laid over the gradient in white at low opacity. Kept faint on purpose: it
 * gives the cover depth without competing with the emoji.
 */
const textures: ((r: (n: number) => number) => { image: string; size: string })[] = [
  // Dot grid.
  (r) => {
    const gap = 12 + r(8);
    return {
      image: "radial-gradient(circle, rgba(255,255,255,0.20) 1.4px, transparent 1.5px)",
      size: `${gap}px ${gap}px`,
    };
  },
  // Blueprint grid.
  (r) => {
    const gap = 18 + r(12);
    return {
      image:
        "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)," +
        "linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
      size: `${gap}px ${gap}px, ${gap}px ${gap}px`,
    };
  },
  // Diagonal stripes.
  (r) => {
    const band = 6 + r(4);
    return {
      image: `repeating-linear-gradient(${r(2) ? 45 : 135}deg, rgba(255,255,255,0.10) 0 ${band}px, transparent ${band}px ${band + 12 + r(8)}px)`,
      size: "auto",
    };
  },
  // Concentric rings from a corner.
  (r) => ({
    image: `repeating-radial-gradient(circle at ${r(2) ? "85% 15%" : "15% 85%"}, rgba(255,255,255,0.13) 0 2px, transparent 2px ${16 + r(10)}px)`,
    size: "auto",
  }),
  // Soft vertical bands.
  (r) => {
    const band = 10 + r(8);
    return {
      image: `repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 ${band}px, transparent ${band}px ${band + 16 + r(12)}px)`,
      size: "auto",
    };
  },
];

export type CoverArt = {
  /** Full background stack: highlight, tint and base gradient. */
  background: string;
  /** Texture layer laid over the gradient. */
  textureImage: string;
  textureSize: string;
  /** The category emoji shown in the middle. */
  glyph: string;
};

export function coverArt(categoryIcon: string, gigSlug: string): CoverArt {
  const r = reader(hash32(gigSlug));

  // Deep, saturated colour rather than a pastel wash: the emoji and the seller badge
  // both sit on top of it and need something dark enough to read against.
  const hue = r(360);
  const second = (hue + 24 + r(60)) % 360;
  const tilt = 100 + r(160);
  const highlight = r(2) ? "18% 12%" : "82% 14%";

  const background = [
    `radial-gradient(circle at ${highlight}, hsl(${(hue + 340) % 360} 92% 74% / 0.45), transparent 58%)`,
    `radial-gradient(circle at 78% 88%, hsl(${second} 88% 40% / 0.55), transparent 62%)`,
    `linear-gradient(${tilt}deg, hsl(${hue} 70% 47%), hsl(${second} 66% 31%))`,
  ].join(", ");

  const texture = textures[r(textures.length)](r);
  // "hizmet"/"hizmeti" ("service") is boilerplate in nearly every listing's title —
  // stripped before matching so it can never trip the "hiz" (speed) topic, which
  // otherwise put a lightning bolt on almost every cover regardless of category.
  const tokens = slugTokens(gigSlug).replace(/-hizmeti?-/g, "-");
  const topic = topics.find(([pattern]) => tokens.includes(`-${pattern}`));
  const set = topic ? topic[1] : glyphs[categoryIcon] ?? glyphs.sparkles;

  return {
    background,
    textureImage: texture.image,
    textureSize: texture.size,
    glyph: set[r(set.length)],
  };
}
