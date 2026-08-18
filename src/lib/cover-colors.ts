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

/**
 * Cover photo for a listing that has no uploaded one.
 *
 * This used to be a keyword search on loremflickr. A narrow search there resolves to a
 * handful of photos, so unrelated listings kept showing the same picture however the
 * seed varied, and the "istanbul" keyword pulled in mosques. Picsum serves one large
 * curated set instead and maps a seed onto it, so neighbouring cards land on different
 * photos and no keyword can steer the result somewhere unsuitable.
 */
export function coverImageUrl(
  gigSlug: string,
  size: `${number}/${number}` = "600/400"
) {
  return `https://picsum.photos/seed/${encodeURIComponent(gigSlug)}/${size.replace("/", "/")}`;
}
