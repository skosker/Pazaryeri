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

export function coverImageUrl(slug: string, size: `${number}/${number}` = "600/400") {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${size}`;
}
