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

const categoryKeywords: Record<string, string> = {
  "grafik-tasarim": "graphic-design,branding",
  "yazilim-web": "coding,programming",
  "yazi-ceviri": "writing,typewriter",
  "video-animasyon": "video-editing,filmmaking",
  "dijital-pazarlama": "marketing,advertising",
  "muzik-ses": "music,audio",
  "is-danismanlik": "business,consulting",
  "egitim-ders": "education,elearning",
  "ai-otomasyon": "artificial-intelligence,robot",
  "veri-analitik": "data,analytics",
};

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 1000;
}

export function coverImageUrl(
  categorySlug: string,
  gigSlug: string,
  size: `${number}/${number}` = "600/400"
) {
  const keywords = categoryKeywords[categorySlug] ?? "business,office";
  const lock = hashSeed(gigSlug);
  return `https://loremflickr.com/${size}/${keywords}?lock=${lock}`;
}
