/**
 * Gig cover artwork, drawn per listing.
 *
 * Two stock-photo routes were tried first and neither worked. A keyword search
 * (loremflickr) matched the category but resolved to a handful of photos, so unrelated
 * listings showed the same picture and the "istanbul" keyword dragged in mosques. A
 * large seeded set (picsum) gave every listing its own photo but knew nothing about the
 * category, so a landscape ended up on a logo-design listing.
 *
 * The artwork is drawn here instead: the motif comes from the category, the palette and
 * layout from the gig slug. That is relevant, unique per listing, safe by construction
 * and needs no network. A seller's uploaded cover still takes precedence.
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
    return n <= 1 ? 0 : state % n;
  };
}

export type Prim =
  | { t: "rect"; x: number; y: number; w: number; h: number; rx?: number; fill: string; o?: number }
  | { t: "circle"; cx: number; cy: number; r: number; fill: string; o?: number }
  | { t: "path"; d: string; fill?: string; stroke?: string; sw?: number; o?: number };

export type CoverArt = { background: string; prims: Prim[] };

/** Drawn on a 120x80 canvas, cropped to the card with xMidYMid slice. */
const W = 120;
const H = 80;

type Ink = { deep: string; mid: string; soft: string; pale: string };

type Motif = (r: (n: number) => number, ink: Ink) => Prim[];

const motifs: Record<string, Motif> = {
  // Yazılım & Web — a code window with brackets.
  code: (r, ink) => {
    const lines = 3 + r(2);
    const prims: Prim[] = [
      { t: "rect", x: 22, y: 16, w: 76, h: 48, rx: 5, fill: ink.pale },
      { t: "rect", x: 22, y: 16, w: 76, h: 9, rx: 5, fill: ink.soft },
      { t: "circle", cx: 28, cy: 20.5, r: 1.6, fill: ink.mid },
      { t: "circle", cx: 33, cy: 20.5, r: 1.6, fill: ink.mid },
      { t: "path", d: "M40 34 L34 42 L40 50", stroke: ink.deep, sw: 2.4 },
      { t: "path", d: "M80 34 L86 42 L80 50", stroke: ink.deep, sw: 2.4 },
      { t: "path", d: "M66 31 L54 53", stroke: ink.mid, sw: 2.4 },
    ];
    // Code lines to the right of the brackets, varying in count and length so two
    // listings in the same category do not draw the identical window.
    for (let i = 0; i < lines; i++) {
      const w = 8 + r(14);
      prims.push({
        t: "rect",
        x: 92 - w,
        y: 33 + i * 7,
        w,
        h: 3,
        rx: 1.5,
        fill: i === 0 ? ink.deep : ink.mid,
        o: 0.75,
      });
    }
    return prims;
  },

  // Grafik Tasarım — pen nib over colour swatches.
  palette: (r, ink) => {
    const swatches = 3 + r(2);
    const prims: Prim[] = [
      { t: "path", d: "M52 14 L68 30 L46 56 L34 60 L38 48 Z", fill: ink.soft },
      { t: "path", d: "M52 14 L68 30 L62 36 L46 20 Z", fill: ink.deep, o: 0.85 },
      { t: "path", d: "M38 48 L46 56 L38 60 Z", fill: ink.deep },
    ];
    for (let i = 0; i < swatches; i++) {
      prims.push({
        t: "rect",
        x: 74,
        y: 20 + i * (13 + r(2)),
        w: 22 + r(8),
        h: 9,
        rx: 3,
        fill: i % 2 ? ink.mid : ink.deep,
        o: 0.75,
      });
    }
    return prims;
  },

  // Yazı & Çeviri — a page of text with a translation arrow.
  pen: (r, ink) => {
    const rows = 4 + r(2);
    const prims: Prim[] = [{ t: "rect", x: 26, y: 12, w: 42, h: 56, rx: 4, fill: ink.pale }];
    for (let i = 0; i < rows; i++) {
      prims.push({
        t: "rect",
        x: 32,
        y: 22 + i * 9,
        w: 20 + r(10),
        h: 3,
        rx: 1.5,
        fill: ink.mid,
        o: 0.8,
      });
    }
    prims.push({ t: "rect", x: 78, y: 12, w: 20, h: 56, rx: 4, fill: ink.soft });
    prims.push({ t: "path", d: "M70 40 L76 40 M73 36 L77 40 L73 44", stroke: ink.deep, sw: 2.2 });
    return prims;
  },

  // Video & Animasyon — film frame with a play mark and a timeline.
  video: (r, ink) => {
    const cells = 4 + r(2);
    const prims: Prim[] = [
      { t: "rect", x: 24, y: 14, w: 72, h: 40, rx: 5, fill: ink.pale },
      { t: "path", d: "M54 26 L72 34 L54 42 Z", fill: ink.deep },
    ];
    for (let i = 0; i < cells; i++) {
      prims.push({
        t: "rect",
        x: 24 + i * (72 / cells) + 3,
        y: 60,
        w: 72 / cells - 6,
        h: 8,
        rx: 2,
        fill: i === 1 ? ink.deep : ink.mid,
        o: 0.7,
      });
    }
    return prims;
  },

  // Dijital Pazarlama — a megaphone with reach waves.
  megaphone: (r, ink) => {
    const waves = 2 + r(2);
    const prims: Prim[] = [
      { t: "path", d: "M30 34 L62 22 L62 58 L30 46 Z", fill: ink.deep, o: 0.9 },
      { t: "rect", x: 24, y: 34, w: 8, h: 12, rx: 2, fill: ink.mid },
      { t: "path", d: "M36 47 L40 62 L47 62 L43 48 Z", fill: ink.mid },
    ];
    for (let i = 0; i < waves; i++) {
      const rad = 10 + i * 9;
      prims.push({
        t: "path",
        d: `M${68 + i * 6} ${40 - rad * 0.6} A ${rad} ${rad} 0 0 1 ${68 + i * 6} ${40 + rad * 0.6}`,
        stroke: ink.deep,
        sw: 2.4,
        o: 0.7 - i * 0.15,
      });
    }
    return prims;
  },

  // Müzik & Ses — a waveform.
  music: (r, ink) => {
    const bars = 12 + r(6);
    const prims: Prim[] = [];
    for (let i = 0; i < bars; i++) {
      const h = 6 + r(38);
      prims.push({
        t: "rect",
        x: 20 + i * (80 / bars),
        y: 40 - h / 2,
        w: 80 / bars - 2.5,
        h,
        rx: 2,
        fill: i % 3 === 0 ? ink.deep : ink.mid,
        o: 0.85,
      });
    }
    return prims;
  },

  // İş & Danışmanlık — briefcase with a rising line.
  briefcase: (r, ink) => {
    const steps = 3 + r(2);
    const prims: Prim[] = [
      { t: "rect", x: 30, y: 28, w: 60, h: 38, rx: 5, fill: ink.pale },
      { t: "rect", x: 30, y: 40, w: 60, h: 4, fill: ink.soft },
      { t: "path", d: "M50 28 L50 22 A3 3 0 0 1 53 19 L67 19 A3 3 0 0 1 70 22 L70 28", stroke: ink.deep, sw: 2.6 },
    ];
    let x = 38;
    let y = 60;
    let d = `M${x} ${y}`;
    for (let i = 0; i < steps; i++) {
      x += 12 + r(4);
      y -= 6 + r(5);
      d += ` L${x} ${y}`;
    }
    prims.push({ t: "path", d, stroke: ink.deep, sw: 2.6 });
    return prims;
  },

  // Eğitim & Ders — an open book.
  book: (r, ink) => {
    const rows = 2 + r(2);
    const prims: Prim[] = [
      { t: "path", d: "M60 24 C50 18 38 18 28 22 L28 60 C38 56 50 56 60 62 Z", fill: ink.pale },
      { t: "path", d: "M60 24 C70 18 82 18 92 22 L92 60 C82 56 70 56 60 62 Z", fill: ink.soft },
      { t: "path", d: "M60 24 L60 62", stroke: ink.deep, sw: 2.2 },
    ];
    for (let i = 0; i < rows; i++) {
      prims.push({ t: "rect", x: 34, y: 30 + i * 8, w: 18 + r(4), h: 2.6, rx: 1.3, fill: ink.mid, o: 0.8 });
      prims.push({ t: "rect", x: 68, y: 30 + i * 8, w: 18 + r(4), h: 2.6, rx: 1.3, fill: ink.deep, o: 0.6 });
    }
    return prims;
  },

  // AI & Otomasyon — connected nodes.
  cpu: (r, ink) => {
    const prims: Prim[] = [
      { t: "rect", x: 46, y: 28, w: 28, h: 24, rx: 5, fill: ink.deep, o: 0.9 },
      { t: "rect", x: 54, y: 35, w: 12, h: 10, rx: 2, fill: ink.pale },
    ];
    const nodes = 4 + r(3);
    for (let i = 0; i < nodes; i++) {
      const a = (i / nodes) * Math.PI * 2 + r(10) / 20;
      const cx = 60 + Math.cos(a) * (30 + r(8));
      const cy = 40 + Math.sin(a) * (20 + r(6));
      prims.push({ t: "path", d: `M60 40 L${cx.toFixed(1)} ${cy.toFixed(1)}`, stroke: ink.mid, sw: 1.6, o: 0.8 });
      prims.push({ t: "circle", cx: Number(cx.toFixed(1)), cy: Number(cy.toFixed(1)), r: 3.5, fill: ink.deep });
    }
    return prims;
  },

  // Veri & Analitik — bar chart with a trend line.
  chart: (r, ink) => {
    const bars = 4 + r(3);
    const prims: Prim[] = [
      { t: "path", d: "M26 16 L26 64 L96 64", stroke: ink.mid, sw: 2.2, o: 0.7 },
    ];
    let d = "";
    for (let i = 0; i < bars; i++) {
      const h = 12 + r(34);
      const x = 34 + i * (58 / bars);
      prims.push({ t: "rect", x, y: 64 - h, w: 58 / bars - 5, h, rx: 2, fill: i % 2 ? ink.mid : ink.deep, o: 0.85 });
      d += `${i === 0 ? "M" : " L"}${(x + 4).toFixed(1)} ${(64 - h - 5).toFixed(1)}`;
    }
    prims.push({ t: "path", d, stroke: ink.deep, sw: 2.4 });
    return prims;
  },

  sparkles: (r, ink) => [
    { t: "path", d: "M60 20 L66 36 L82 42 L66 48 L60 64 L54 48 L38 42 L54 36 Z", fill: ink.deep, o: 0.85 },
    { t: "circle", cx: 90, cy: 26, r: 4 + r(3), fill: ink.mid },
    { t: "circle", cx: 32, cy: 58, r: 3 + r(3), fill: ink.soft },
  ],
};

/**
 * `categoryIcon` is the value stored on Category.icon, so the motif follows whatever the
 * admin picked for that category; unknown values fall back to the sparkles motif.
 */
export function coverArt(categoryIcon: string, gigSlug: string): CoverArt {
  const r = reader(hash32(gigSlug));

  // One hue per listing keeps neighbouring cards apart while the motif keeps them
  // recognisably part of the same category.
  const hue = r(360);
  const tilt = r(360);
  const background = `linear-gradient(${tilt}deg, hsl(${hue} 64% 95%), hsl(${(hue + 30 + r(40)) % 360} 58% 88%))`;

  const ink: Ink = {
    deep: `hsl(${hue} 62% 42%)`,
    mid: `hsl(${(hue + 18) % 360} 55% 60%)`,
    soft: `hsl(${(hue + 34) % 360} 62% 80%)`,
    pale: `hsl(${hue} 70% 97%)`,
  };

  const motif = motifs[categoryIcon] ?? motifs.sparkles;
  return { background, prims: motif(r, ink) };
}

export const COVER_VIEWBOX = `0 0 ${W} ${H}`;
