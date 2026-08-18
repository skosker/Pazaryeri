/**
 * Generated gig covers.
 *
 * Covers used to come from a keyword search on a stock-photo service. Narrow searches
 * return only a handful of photos, so unrelated listings showed the same picture no
 * matter how the seed varied, and the "istanbul" keyword pulled in mosques and other
 * religious imagery that has no business on a service listing.
 *
 * The artwork is now drawn from the gig slug. A unique hash alone was not enough — the
 * first attempt varied only the hue, so every card in a category still read as the same
 * washed gradient behind the same glyph. The seed now picks a composition as well as a
 * palette, so neighbouring cards differ in shape, not just tint.
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

/** Deterministic 0..n-1 stream, so each drawing decision gets its own bits. */
function reader(seed: number) {
  let state = seed || 1;
  return (n: number) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state % n;
  };
}

export type Shape =
  | { kind: "circle"; cx: number; cy: number; r: number; fill: string; opacity: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; fill: string; opacity: number; rotate: number }
  | { kind: "path"; d: string; fill: string; opacity: number };

export type CoverArt = { background: string; shapes: Shape[] };

const COMPOSITIONS = ["blobs", "stripes", "arcs", "grid", "waves", "shards"] as const;

/**
 * Viewport is a 100x100 square scaled by the SVG's preserveAspectRatio, so the numbers
 * below read as percentages of the cover.
 */
export function coverArt(gigSlug: string): CoverArt {
  const seed = hash32(gigSlug);
  const next = reader(seed);

  // This is what shows when a photo cannot be fetched, so it stays quiet: pale ground,
  // low-contrast shapes. The composition still varies per gig, but a card that falls
  // back should read as a calm placeholder rather than compete with its neighbours.
  const hue = next(360);
  const spread = 25 + next(70);
  const light = 90 + next(5);
  const background = `linear-gradient(${next(360)}deg, hsl(${hue} 46% ${light}%), hsl(${(hue + spread) % 360} 42% ${light - 6}%))`;

  const tone = (i: number, lightness = 78) =>
    `hsl(${(hue + spread * (i + 1) + next(30)) % 360} 52% ${lightness}%)`;

  const composition = COMPOSITIONS[next(COMPOSITIONS.length)];
  const shapes: Shape[] = [];

  if (composition === "blobs") {
    for (let i = 0; i < 3 + next(2); i++) {
      shapes.push({
        kind: "circle",
        cx: 10 + next(80),
        cy: 10 + next(80),
        r: 18 + next(26),
        fill: tone(i),
        opacity: 0.18 + next(14) / 100,
      });
    }
  } else if (composition === "stripes") {
    const angle = next(90) - 45;
    for (let i = 0; i < 5 + next(4); i++) {
      shapes.push({
        kind: "rect",
        x: -30 + i * (14 + next(8)),
        y: -40,
        w: 4 + next(9),
        h: 180,
        fill: tone(i % 3),
        opacity: 0.14 + next(12) / 100,
        rotate: angle,
      });
    }
  } else if (composition === "arcs") {
    const cx = next(100);
    const cy = next(100);
    for (let i = 5; i > 0; i--) {
      shapes.push({
        kind: "circle",
        cx,
        cy,
        r: i * (12 + next(6)),
        fill: tone(i % 3, 74 + i * 3),
        opacity: 0.13,
      });
    }
  } else if (composition === "grid") {
    const step = 16 + next(10);
    for (let x = step / 2; x < 100; x += step) {
      for (let y = step / 2; y < 100; y += step) {
        shapes.push({
          kind: "circle",
          cx: x,
          cy: y,
          r: 2 + next(5),
          fill: tone(next(3)),
          opacity: 0.16 + next(14) / 100,
        });
      }
    }
  } else if (composition === "waves") {
    for (let i = 0; i < 3 + next(2); i++) {
      const y = 20 + i * (18 + next(8));
      const amp = 8 + next(14);
      shapes.push({
        kind: "path",
        d: `M-10 ${y} Q 25 ${y - amp} 50 ${y} T 110 ${y} L110 130 L-10 130 Z`,
        fill: tone(i),
        opacity: 0.15 + next(12) / 100,
      });
    }
  } else {
    for (let i = 0; i < 4 + next(3); i++) {
      const x = next(100);
      const y = next(100);
      const s = 14 + next(30);
      shapes.push({
        kind: "path",
        d: `M${x} ${y} L${x + s} ${y + next(20) - 10} L${x + s / 2} ${y + s} Z`,
        fill: tone(i),
        opacity: 0.16 + next(12) / 100,
      });
    }
  }

  return { background, shapes };
}
