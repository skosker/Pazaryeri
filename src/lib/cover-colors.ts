export const coverGradients: Record<string, string> = {
  rose: "from-rose-200 via-rose-100 to-orange-100",
  sky: "from-sky-200 via-sky-100 to-blue-100",
  violet: "from-violet-200 via-violet-100 to-purple-100",
  amber: "from-amber-200 via-amber-100 to-yellow-100",
  emerald: "from-emerald-200 via-emerald-100 to-teal-100",
  indigo: "from-indigo-200 via-indigo-100 to-blue-100",
};

export function coverGradientClass(color: string) {
  return coverGradients[color] ?? coverGradients.indigo;
}

// Several keyword sets per category, so ~98 listings in one category are not all
// drawing from the same photo pool. One set in each group keeps an Istanbul/Turkey
// flavour, so the catalogue does not read as entirely foreign stock photography.
const categoryKeywords: Record<string, string[]> = {
  "grafik-tasarim": ["graphic-design,branding", "logo,sketch", "designer,workspace", "istanbul,design"],
  "yazilim-web": ["coding,programming", "developer,laptop", "software,screen", "istanbul,office"],
  "yazi-ceviri": ["writing,typewriter", "notebook,pen", "books,translation", "istanbul,writing"],
  "video-animasyon": ["video-editing,filmmaking", "camera,studio", "animation,motion", "istanbul,film"],
  "dijital-pazarlama": ["marketing,advertising", "social-media,campaign", "billboard,brand", "istanbul,marketing"],
  "muzik-ses": ["music,audio", "recording,studio", "microphone,mixer", "istanbul,music"],
  "is-danismanlik": ["business,consulting", "meeting,strategy", "office,teamwork", "istanbul,business"],
  "egitim-ders": ["education,elearning", "classroom,student", "books,learning", "istanbul,education"],
  "ai-otomasyon": ["artificial-intelligence,robot", "automation,circuit", "machine-learning,server", "istanbul,technology"],
  "veri-analitik": ["data,analytics", "dashboard,chart", "statistics,report", "istanbul,office"],
};

const fallbackKeywords = ["business,office", "workspace,desk", "team,meeting", "istanbul,business"];

/**
 * FNV-1a with a final avalanche step. The lock pins which photo the placeholder
 * service returns, so two gigs landing on the same lock and keywords show the same
 * picture — the previous `% 1000` left far too little room for a catalogue this size
 * and put 81 listings on a shared photo. The full 32-bit range makes a collision
 * vanishingly unlikely, and the avalanche keeps near-identical slugs far apart.
 */
function hashSeed(input: string) {
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

export function coverImageUrl(
  categorySlug: string,
  gigSlug: string,
  size: `${number}/${number}` = "600/400"
) {
  const lock = hashSeed(gigSlug);
  const variants = categoryKeywords[categorySlug] ?? fallbackKeywords;
  const keywords = variants[lock % variants.length];
  return `https://loremflickr.com/${size}/${keywords}?lock=${lock}`;
}
