/**
 * Generated gig covers.
 *
 * These used to come from a keyword search on a stock-photo service. That could not
 * hold up: narrow searches return a handful of photos, so unrelated listings ended up
 * showing the same picture no matter how the seed varied, and the "istanbul" keyword
 * pulled in mosques and other religious imagery that has no place on a service listing.
 *
 * The cover is now derived from the gig slug: every listing gets its own hue, gradient
 * angle and blob layout, so no two look alike, nothing is fetched over the network, and
 * there is no chance of an unsuitable photo. A seller's uploaded cover still wins.
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

export type CoverArt = {
  background: string;
  blobs: { cx: string; cy: string; r: string; color: string }[];
};

/** Same slug always yields the same artwork, so covers stay put between renders. */
export function coverArt(gigSlug: string): CoverArt {
  const h = hash32(gigSlug);

  // Soft, high-lightness pairs keep the artwork calm behind the category glyph.
  const hue = h % 360;
  const hue2 = (hue + 35 + ((h >>> 9) % 40)) % 360;
  const angle = 90 + ((h >>> 4) % 180);

  const background = `linear-gradient(${angle}deg, hsl(${hue} 82% 92%), hsl(${hue2} 74% 84%))`;

  const blobs = [0, 1, 2].map((i) => {
    const s = h >>> (i * 7 + 3);
    return {
      cx: `${12 + (s % 76)}%`,
      cy: `${14 + ((s >>> 5) % 72)}%`,
      r: `${16 + ((s >>> 11) % 22)}%`,
      color: `hsl(${(hue + 60 * i + ((s >>> 3) % 40)) % 360} 78% ${72 + (i * 5)}%)`,
    };
  });

  return { background, blobs };
}
