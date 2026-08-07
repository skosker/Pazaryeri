const accents: Record<string, { bg: string; text: string; ring: string }> = {
  "grafik-tasarim": { bg: "bg-fuchsia-50", text: "text-fuchsia-600", ring: "group-hover:border-fuchsia-200" },
  "yazilim-web": { bg: "bg-indigo-50", text: "text-indigo-600", ring: "group-hover:border-indigo-200" },
  "yazi-ceviri": { bg: "bg-amber-50", text: "text-amber-600", ring: "group-hover:border-amber-200" },
  "video-animasyon": { bg: "bg-rose-50", text: "text-rose-600", ring: "group-hover:border-rose-200" },
  "dijital-pazarlama": { bg: "bg-sky-50", text: "text-sky-600", ring: "group-hover:border-sky-200" },
  "muzik-ses": { bg: "bg-violet-50", text: "text-violet-600", ring: "group-hover:border-violet-200" },
  "is-danismanlik": { bg: "bg-emerald-50", text: "text-emerald-600", ring: "group-hover:border-emerald-200" },
  "egitim-ders": { bg: "bg-orange-50", text: "text-orange-600", ring: "group-hover:border-orange-200" },
  "ai-otomasyon": { bg: "bg-cyan-50", text: "text-cyan-600", ring: "group-hover:border-cyan-200" },
  "veri-analitik": { bg: "bg-teal-50", text: "text-teal-600", ring: "group-hover:border-teal-200" },
};

const fallback = { bg: "bg-purple-50", text: "text-purple-600", ring: "group-hover:border-purple-200" };

export function getCategoryAccent(slug: string) {
  return accents[slug] ?? fallback;
}
