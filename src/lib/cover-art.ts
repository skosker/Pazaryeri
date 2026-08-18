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

/**
 * Three motifs per category rather than one. A single drawing per category meant every
 * card in a listing page repeated the same shape with only the tint changing, which
 * reads as "all the same" however different the palette is.
 */
const motifs: Record<string, Motif[]> = {
  // Yazılım & Web — a code window with brackets.
  code: [
    (r, ink) => {
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
    // Terminal prompt
    (r, ink) => {
      const rows = 3 + r(3);
      const prims: Prim[] = [
        { t: "rect", x: 18, y: 14, w: 84, h: 52, rx: 6, fill: ink.deep, o: 0.92 },
        { t: "rect", x: 18, y: 14, w: 84, h: 8, rx: 6, fill: ink.mid },
      ];
      for (let i = 0; i < rows; i++) {
        prims.push({ t: "path", d: `M26 ${30 + i * 9} l4 3 l-4 3`, stroke: ink.pale, sw: 2 });
        prims.push({ t: "rect", x: 34, y: 31 + i * 9, w: 20 + r(34), h: 3, rx: 1.5, fill: ink.pale, o: 0.7 });
      }
      return prims;
    },
    // Stacked layers / deployment
    (r, ink) => {
      const layers = 3 + r(2);
      const prims: Prim[] = [];
      for (let i = 0; i < layers; i++) {
        prims.push({
          t: "path",
          d: `M60 ${20 + i * 13} L92 ${28 + i * 13} L60 ${36 + i * 13} L28 ${28 + i * 13} Z`,
          fill: i % 2 ? ink.mid : ink.deep,
          o: 0.55 + i * 0.12,
        });
      }
      return prims;
    },
  ],

  // Grafik Tasarım — pen nib over colour swatches.
  palette: [
    (r, ink) => {
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
    // Colour wheel
    (r, ink) => {
      const wedges = 5 + r(3);
      const prims: Prim[] = [{ t: "circle", cx: 60, cy: 40, r: 26, fill: ink.pale }];
      for (let i = 0; i < wedges; i++) {
        const a0 = (i / wedges) * Math.PI * 2;
        const a1 = ((i + 1) / wedges) * Math.PI * 2;
        prims.push({
          t: "path",
          d: `M60 40 L${(60 + Math.cos(a0) * 26).toFixed(1)} ${(40 + Math.sin(a0) * 26).toFixed(1)} A26 26 0 0 1 ${(60 + Math.cos(a1) * 26).toFixed(1)} ${(40 + Math.sin(a1) * 26).toFixed(1)} Z`,
          fill: i % 2 ? ink.deep : ink.mid,
          o: 0.55 + (i % 3) * 0.15,
        });
      }
      prims.push({ t: "circle", cx: 60, cy: 40, r: 8, fill: ink.pale });
      return prims;
    },
    // Layout frame
    (r, ink) => {
      const blocks = 3 + r(2);
      const prims: Prim[] = [{ t: "rect", x: 26, y: 14, w: 68, h: 52, rx: 5, fill: ink.pale }];
      prims.push({ t: "rect", x: 32, y: 20, w: 56, h: 14, rx: 3, fill: ink.deep, o: 0.8 });
      for (let i = 0; i < blocks; i++) {
        prims.push({ t: "rect", x: 32 + i * (56 / blocks), y: 40, w: 56 / blocks - 4, h: 20, rx: 3, fill: ink.mid, o: 0.75 });
      }
      return prims;
    },
  ],

  // Yazı & Çeviri — a page of text with a translation arrow.
  pen: [
    (r, ink) => {
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
    // Quote mark over lines
    (r, ink) => {
      const rows = 3 + r(2);
      const prims: Prim[] = [
        { t: "path", d: "M34 20 q-8 10 -8 20 h12 v-14 h-6 q1 -4 6 -6 Z", fill: ink.deep, o: 0.85 },
        { t: "path", d: "M56 20 q-8 10 -8 20 h12 v-14 h-6 q1 -4 6 -6 Z", fill: ink.mid, o: 0.85 },
      ];
      for (let i = 0; i < rows; i++) {
        prims.push({ t: "rect", x: 30, y: 50 + i * 8, w: 30 + r(30), h: 3, rx: 1.5, fill: ink.mid, o: 0.7 });
      }
      return prims;
    },
    // Two language bubbles
    (r, ink) => {
      const prims: Prim[] = [
        { t: "rect", x: 20, y: 18, w: 44, h: 26, rx: 8, fill: ink.deep, o: 0.85 },
        { t: "path", d: "M32 44 L30 54 L42 44 Z", fill: ink.deep, o: 0.85 },
        { t: "rect", x: 58, y: 40, w: 44, h: 26, rx: 8, fill: ink.mid, o: 0.85 },
        { t: "path", d: "M88 66 L92 76 L78 66 Z", fill: ink.mid, o: 0.85 },
      ];
      for (let i = 0; i < 2 + r(2); i++) {
        prims.push({ t: "rect", x: 27, y: 25 + i * 7, w: 16 + r(16), h: 3, rx: 1.5, fill: ink.pale, o: 0.8 });
        prims.push({ t: "rect", x: 65, y: 47 + i * 7, w: 16 + r(16), h: 3, rx: 1.5, fill: ink.pale, o: 0.8 });
      }
      return prims;
    },
  ],

  // Video & Animasyon — film frame with a play mark and a timeline.
  video: [
    (r, ink) => {
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
    // Film strip
    (r, ink) => {
      const frames = 3 + r(2);
      const prims: Prim[] = [{ t: "rect", x: 16, y: 22, w: 88, h: 36, rx: 4, fill: ink.deep, o: 0.9 }];
      for (let i = 0; i < frames; i++) {
        prims.push({ t: "rect", x: 22 + i * (88 / frames), y: 30, w: 88 / frames - 8, h: 20, rx: 2, fill: ink.pale });
      }
      for (let i = 0; i < 6; i++) {
        prims.push({ t: "rect", x: 20 + i * 16, y: 24, w: 5, h: 4, rx: 1, fill: ink.pale, o: 0.7 });
        prims.push({ t: "rect", x: 20 + i * 16, y: 52, w: 5, h: 4, rx: 1, fill: ink.pale, o: 0.7 });
      }
      return prims;
    },
    // Camera on tripod
    (r, ink) => [
      { t: "rect", x: 30, y: 22, w: 44, h: 26, rx: 5, fill: ink.deep, o: 0.9 },
      { t: "path", d: "M74 30 L92 24 L92 46 L74 40 Z", fill: ink.mid },
      { t: "circle", cx: 46, cy: 35, r: 6 + r(3), fill: ink.pale },
      { t: "path", d: "M52 48 L44 68 M52 48 L62 68 M52 48 L52 68", stroke: ink.mid, sw: 2.6 },
    ],
  ],

  // Dijital Pazarlama — a megaphone with reach waves.
  megaphone: [
    (r, ink) => {
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
    // Rising funnel
    (r, ink) => {
      const steps = 3 + r(2);
      const prims: Prim[] = [];
      for (let i = 0; i < steps; i++) {
        const w = 66 - i * (46 / steps);
        prims.push({ t: "rect", x: 60 - w / 2, y: 18 + i * (44 / steps), w, h: 44 / steps - 3, rx: 3, fill: i % 2 ? ink.mid : ink.deep, o: 0.85 });
      }
      return prims;
    },
    // Target with arrow
    (r, ink) => {
      const rings = 2 + r(2);
      const prims: Prim[] = [];
      for (let i = rings; i > 0; i--) {
        prims.push({ t: "circle", cx: 56, cy: 40, r: i * 9, fill: i % 2 ? ink.mid : ink.pale, o: 0.9 });
      }
      prims.push({ t: "circle", cx: 56, cy: 40, r: 4, fill: ink.deep });
      prims.push({ t: "path", d: "M88 16 L60 38", stroke: ink.deep, sw: 3 });
      prims.push({ t: "path", d: "M88 16 L80 18 L86 24 Z", fill: ink.deep });
      return prims;
    },
  ],

  // Müzik & Ses — a waveform.
  music: [
    (r, ink) => {
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
    // Note with staff
    (r, ink) => {
      const prims: Prim[] = [];
      for (let i = 0; i < 4; i++) {
        prims.push({ t: "rect", x: 16, y: 22 + i * 10, w: 88, h: 1.6, fill: ink.mid, o: 0.5 });
      }
      prims.push({ t: "circle", cx: 44, cy: 52, r: 8, fill: ink.deep });
      prims.push({ t: "rect", x: 50, y: 18, w: 3.5, h: 34, fill: ink.deep });
      prims.push({ t: "circle", cx: 76, cy: 44, r: 8, fill: ink.mid });
      prims.push({ t: "rect", x: 82, y: 14, w: 3.5, h: 30, fill: ink.mid });
      prims.push({ t: "path", d: `M53 18 q14 ${4 + r(6)} 32 -4`, stroke: ink.deep, sw: 3 });
      return prims;
    },
    // Mixer faders
    (r, ink) => {
      const channels = 4 + r(3);
      const prims: Prim[] = [];
      for (let i = 0; i < channels; i++) {
        const x = 24 + i * (72 / channels);
        const knob = 20 + r(36);
        prims.push({ t: "rect", x: x + 3, y: 16, w: 3, h: 48, rx: 1.5, fill: ink.mid, o: 0.6 });
        prims.push({ t: "rect", x, y: 16 + knob, w: 9, h: 7, rx: 2, fill: ink.deep });
      }
      return prims;
    },
  ],

  // İş & Danışmanlık — briefcase with a rising line.
  briefcase: [
    (r, ink) => {
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
    // Handshake blocks
    (r, ink) => [
      { t: "rect", x: 20, y: 32, w: 34, h: 16, rx: 4, fill: ink.deep, o: 0.9 },
      { t: "rect", x: 66, y: 32, w: 34, h: 16, rx: 4, fill: ink.mid },
      { t: "rect", x: 50, y: 28, w: 20, h: 24, rx: 5, fill: ink.pale },
      { t: "path", d: "M56 40 l4 4 l6 -8", stroke: ink.deep, sw: 2.6 },
    ],
    // Strategy board
    (r, ink) => {
      const notes = 3 + r(3);
      const prims: Prim[] = [{ t: "rect", x: 22, y: 14, w: 76, h: 52, rx: 4, fill: ink.pale }];
      for (let i = 0; i < notes; i++) {
        prims.push({
          t: "rect",
          x: 30 + (i % 3) * 22,
          y: 22 + Math.floor(i / 3) * 22,
          w: 16,
          h: 16,
          rx: 2,
          fill: i % 2 ? ink.mid : ink.deep,
          o: 0.8,
        });
      }
      return prims;
    },
  ],

  // Eğitim & Ders — an open book.
  book: [
    (r, ink) => {
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
    // Graduation cap
    (r, ink) => [
      { t: "path", d: "M60 18 L100 34 L60 50 L20 34 Z", fill: ink.deep, o: 0.9 },
      { t: "path", d: "M36 40 L36 56 q24 12 48 0 L84 40", fill: ink.mid, o: 0.85 },
      { t: "path", d: `M100 34 L100 ${52 + r(8)}`, stroke: ink.deep, sw: 2.4 },
      { t: "circle", cx: 100, cy: 58 + r(6), r: 3.5, fill: ink.deep },
    ],
    // Lesson board
    (r, ink) => {
      const rows = 2 + r(3);
      const prims: Prim[] = [
        { t: "rect", x: 20, y: 14, w: 80, h: 44, rx: 4, fill: ink.pale },
        { t: "rect", x: 20, y: 14, w: 80, h: 44, rx: 4, fill: ink.soft, o: 0.5 },
        { t: "path", d: "M44 58 L44 68 M76 58 L76 68", stroke: ink.mid, sw: 2.4 },
      ];
      for (let i = 0; i < rows; i++) {
        prims.push({ t: "rect", x: 28, y: 22 + i * 10, w: 24 + r(38), h: 3.4, rx: 1.7, fill: ink.deep, o: 0.65 });
      }
      return prims;
    },
  ],

  // AI & Otomasyon — connected nodes.
  cpu: [
    (r, ink) => {
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
    // Chat bubbles from a bot
    (r, ink) => {
      const lines = 2 + r(2);
      const prims: Prim[] = [
        { t: "rect", x: 20, y: 26, w: 30, h: 28, rx: 6, fill: ink.deep, o: 0.9 },
        { t: "circle", cx: 29, cy: 38, r: 3, fill: ink.pale },
        { t: "circle", cx: 41, cy: 38, r: 3, fill: ink.pale },
        { t: "path", d: "M30 46 q5 4 10 0", stroke: ink.pale, sw: 2 },
        { t: "rect", x: 58, y: 20, w: 44, h: 24, rx: 8, fill: ink.mid, o: 0.9 },
        { t: "rect", x: 58, y: 50, w: 34, h: 18, rx: 8, fill: ink.soft },
      ];
      for (let i = 0; i < lines; i++) {
        prims.push({ t: "rect", x: 65, y: 27 + i * 7, w: 14 + r(18), h: 3, rx: 1.5, fill: ink.pale, o: 0.85 });
      }
      return prims;
    },
    // Automation flow
    (r, ink) => {
      const steps = 3 + r(2);
      const prims: Prim[] = [];
      for (let i = 0; i < steps; i++) {
        const x = 22 + i * (76 / steps);
        prims.push({ t: "rect", x, y: 30, w: 76 / steps - 12, h: 20, rx: 5, fill: i % 2 ? ink.mid : ink.deep, o: 0.88 });
        if (i < steps - 1) {
          prims.push({ t: "path", d: `M${x + 76 / steps - 11} 40 L${x + 76 / steps - 3} 40`, stroke: ink.deep, sw: 2.2 });
        }
      }
      return prims;
    },
  ],

  // Veri & Analitik — bar chart with a trend line.
  chart: [
    (r, ink) => {
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
    // Donut breakdown
    (r, ink) => {
      const slices = 3 + r(2);
      const prims: Prim[] = [{ t: "circle", cx: 60, cy: 40, r: 26, fill: ink.pale }];
      let a = 0;
      for (let i = 0; i < slices; i++) {
        const span = (Math.PI * 2) / slices + (r(20) - 10) / 60;
        const a1 = a + span;
        prims.push({
          t: "path",
          d: `M60 40 L${(60 + Math.cos(a) * 26).toFixed(1)} ${(40 + Math.sin(a) * 26).toFixed(1)} A26 26 0 ${span > Math.PI ? 1 : 0} 1 ${(60 + Math.cos(a1) * 26).toFixed(1)} ${(40 + Math.sin(a1) * 26).toFixed(1)} Z`,
          fill: i % 2 ? ink.mid : ink.deep,
          o: 0.85,
        });
        a = a1;
      }
      prims.push({ t: "circle", cx: 60, cy: 40, r: 12, fill: ink.pale });
      return prims;
    },
    // Dashboard tiles
    (r, ink) => {
      const prims: Prim[] = [{ t: "rect", x: 20, y: 14, w: 80, h: 52, rx: 5, fill: ink.pale }];
      prims.push({ t: "rect", x: 26, y: 20, w: 34, h: 18, rx: 3, fill: ink.deep, o: 0.85 });
      prims.push({ t: "rect", x: 64, y: 20, w: 30, h: 18, rx: 3, fill: ink.mid, o: 0.85 });
      const bars = 3 + r(3);
      for (let i = 0; i < bars; i++) {
        const h = 6 + r(16);
        prims.push({ t: "rect", x: 28 + i * (64 / bars), y: 58 - h, w: 64 / bars - 5, h, rx: 2, fill: ink.mid, o: 0.8 });
      }
      return prims;
    },
  ],

  sparkles: [(r, ink) => [
    { t: "path", d: "M60 20 L66 36 L82 42 L66 48 L60 64 L54 48 L38 42 L54 36 Z", fill: ink.deep, o: 0.85 },
    { t: "circle", cx: 90, cy: 26, r: 4 + r(3), fill: ink.mid },
    { t: "circle", cx: 32, cy: 58, r: 3 + r(3), fill: ink.soft },
  ]],
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

  const variants = motifs[categoryIcon] ?? motifs.sparkles;
  const motif = variants[r(variants.length)];
  return { background, prims: motif(r, ink) };
}

export const COVER_VIEWBOX = `0 0 ${W} ${H}`;
