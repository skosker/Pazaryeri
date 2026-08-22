/**
 * The drawn profile photo, composed from a seed string.
 *
 * Generated freelancer profiles need a face each, and a thousand of them cannot come
 * from a photo library without either repeating or putting a real person's picture on a
 * profile that is not theirs. So the picture is drawn here instead: skin, hair, clothes,
 * glasses and beard are all picked from the hash of the seed, which makes every profile
 * recognisably its own without fetching anything.
 *
 * The style is a flat illustration rather than a cartoon: light falls from one side so
 * the face has a shape, the eyes are almonds with a lid and an iris instead of dots, the
 * mouth is a restrained line, and the palette is muted — the flat fills and the wide grin
 * were what made the earlier version read as a caricature.
 *
 * A seed starting with "k-" or "e-" asks for a feminine or masculine face, so the
 * picture matches the name the generator handed out; any other seed picks for itself.
 * Nothing from the seed is written into the markup — it only ever feeds the hash — so
 * the output is fixed text no matter what arrives in the URL.
 *
 * Rendered by /api/avatar/[seed], which is what `User.image` points at.
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

/** Deterministic 0..n-1 stream, so each feature of the face gets its own bits. */
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

const backgrounds = [
  ["#e7ebf2", "#cdd6e4"],
  ["#eceae6", "#d9d3c9"],
  ["#e4eceb", "#c9dcd8"],
  ["#eee8e6", "#dbcac6"],
  ["#e6e9ef", "#c8cfdd"],
  ["#ebe9f0", "#d2cede"],
  ["#e8ece7", "#ccd6c8"],
  ["#f0ece6", "#ded2c2"],
  ["#e5eaee", "#c6d2da"],
  ["#eae7ec", "#d3ccd6"],
];

const skins = ["#f2d3bb", "#e8c1a3", "#d9a680", "#c08c63", "#a3714c", "#845737"];

const hairColours = ["#241c17", "#33261c", "#4a3527", "#6b4b32", "#8a6440", "#b08b5e", "#8f9299", "#3a2622"];

const clothes = ["#3f4f6b", "#4a5b52", "#6b4f52", "#3d4450", "#5b5470", "#6d5f4a", "#2f3b45", "#7a5c58", "#455a64"];

/** Darkens a #rrggbb colour by `amount` (0..1), for the neck shadow and collar. */
function shade(hex: string, amount: number) {
  const value = parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 0xff, value & 0xff].map((channel) =>
    Math.max(0, Math.round(channel * (1 - amount)))
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/** The cap of hair sitting on the head, plus whatever falls behind it. */
function hairStyle(index: number, colour: string) {
  const dark = shade(colour, 0.25);

  switch (index) {
    // Kısa dalgalı
    case 0:
      return {
        back: "",
        front: `<path d="M51 68 C 49 41 63 29 80 29 C 97 29 111 41 109 68 C 106 51 98 45 80 45 C 62 45 54 51 51 68 Z" fill="${colour}"/>`,
      };
    // Yana ayrılmış
    case 1:
      return {
        back: "",
        front: `<path d="M51 66 C 49 38 65 28 80 28 C 99 28 111 40 109 64 C 101 46 84 43 67 48 C 59 51 53 57 51 66 Z" fill="${colour}"/>`,
      };
    // Kısa kesim
    case 2:
      return {
        back: "",
        front: `<path d="M52 66 C 52 40 64 31 80 31 C 96 31 108 40 108 66 C 105 55 96 51 80 51 C 64 51 55 55 52 66 Z" fill="${colour}"/>`,
      };
    // Kıvırcık
    case 3:
      return {
        back: "",
        front:
          `<path d="M51 66 C 49 41 63 30 80 30 C 97 30 111 41 109 66 C 106 50 98 44 80 44 C 62 44 54 50 51 66 Z" fill="${colour}"/>` +
          `<circle cx="58" cy="50" r="10" fill="${colour}"/><circle cx="70" cy="38" r="11" fill="${colour}"/>` +
          `<circle cx="84" cy="35" r="11" fill="${colour}"/><circle cx="97" cy="41" r="10" fill="${colour}"/>` +
          `<circle cx="105" cy="53" r="9" fill="${colour}"/>`,
      };
    // Saçları geriye toplanmış (topuz)
    case 4:
      return {
        back: `<circle cx="80" cy="21" r="12" fill="${dark}"/>`,
        front: `<path d="M51 67 C 49 40 63 30 80 30 C 97 30 111 40 109 67 C 105 52 96 46 80 46 C 64 46 55 52 51 67 Z" fill="${colour}"/>`,
      };
    // Uzun düz
    case 5:
      return {
        back:
          `<path d="M45 66 C 43 33 62 23 80 23 C 98 23 117 33 115 66 L 117 128 L 99 128 ` +
          `C 105 106 105 82 101 66 L 59 66 C 55 82 55 106 61 128 L 43 128 Z" fill="${colour}"/>`,
        front: `<path d="M52 66 C 50 40 64 30 80 30 C 96 30 110 40 108 66 C 104 50 96 45 80 45 C 63 45 55 51 52 66 Z" fill="${colour}"/>`,
      };
    // Omuz hizası dalgalı
    case 6:
      return {
        back:
          `<path d="M44 68 C 42 34 62 24 80 24 C 98 24 118 34 116 68 C 119 90 116 106 110 116 ` +
          `C 110 96 107 80 102 68 L 58 68 C 53 80 50 96 50 116 C 44 106 41 90 44 68 Z" fill="${colour}"/>`,
        front: `<path d="M52 67 C 50 39 65 29 80 29 C 95 29 110 39 108 67 C 103 51 95 46 80 46 C 65 46 56 51 52 67 Z" fill="${colour}"/>`,
      };
    // Açılmış saç çizgisi
    default:
      return {
        back: "",
        front:
          `<path d="M52 68 C 51 46 62 34 80 34 C 98 34 109 46 108 68 C 106 58 99 53 88 52 ` +
          `C 92 46 88 42 80 42 C 72 42 68 46 72 52 C 61 53 54 58 52 68 Z" fill="${colour}"/>`,
      };
  }
}

const feminineHair = [0, 3, 4, 5, 6];
const masculineHair = [0, 1, 2, 3, 7];

/**
 * The whole picture as one SVG document. Deterministic: the same seed always draws the
 * same face, which is what lets the URL be cached forever.
 */
export function avatarSvg(seed: string): string {
  const r = reader(hash32(seed));

  const feminine = seed.startsWith("k-") ? true : seed.startsWith("e-") ? false : r(2) === 0;

  const [bgFrom, bgTo] = backgrounds[r(backgrounds.length)];
  const skinIndex = r(skins.length);
  // Light blond over the two palest skins comes out looking like a bare scalp rather
  // than hair, so that one pairing falls back to the shade below it.
  let hairIndex = r(hairColours.length);
  if (hairIndex === 5 && skinIndex <= 1) hairIndex = 4;
  const skin = skins[skinIndex];
  const hairColour = hairColours[hairIndex];
  const shirt = clothes[r(clothes.length)];
  const styles = feminine ? feminineHair : masculineHair;
  const hair = hairStyle(styles[r(styles.length)], hairColour);
  const beard = !feminine && r(10) < 4;
  const glasses = r(10) < 3;
  const smiling = r(4) > 0;

  const brow = shade(hairColour, 0.15);

  // The gradient id has to be unique: two avatars inlined in the same page would
  // otherwise share whichever gradient was defined first. Base36 of the hash keeps it
  // to [0-9a-z], so nothing from the seed reaches the markup as text.
  const gradientId = `a${hash32(seed).toString(36)}`;

  const parts = [
    `<defs>` +
      `<linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="${bgFrom}"/><stop offset="100%" stop-color="${bgTo}"/></linearGradient>` +
      // Light falls from the upper left, so the face carries a soft shadow on the other
      // side instead of being one flat colour — that flatness is what reads as a cartoon.
      `<linearGradient id="${gradientId}s" x1="0.15" y1="0" x2="0.9" y2="1">` +
      `<stop offset="0%" stop-color="${shade(skin, -0.04)}"/>` +
      `<stop offset="62%" stop-color="${skin}"/>` +
      `<stop offset="100%" stop-color="${shade(skin, 0.14)}"/></linearGradient>` +
      `<linearGradient id="${gradientId}h" x1="0.2" y1="0" x2="0.8" y2="1">` +
      `<stop offset="0%" stop-color="${shade(hairColour, -0.12)}"/>` +
      `<stop offset="100%" stop-color="${shade(hairColour, 0.18)}"/></linearGradient>` +
      `</defs>`,
    `<rect width="160" height="160" fill="url(#${gradientId})"/>`,
    hair.back,
    `<path d="M70 84 h20 v26 a10 10 0 0 1 -20 0 Z" fill="${shade(skin, 0.16)}"/>`,
    `<path d="M20 160 C 20 126 46 110 80 110 C 114 110 140 126 140 160 Z" fill="${shirt}"/>`,
    // The collar sits in the neck's shadow rather than being a bright band of its own.
    `<path d="M64 112 Q80 128 96 112 Q80 121 64 112 Z" fill="${shade(shirt, 0.3)}"/>`,
    `<ellipse cx="53" cy="73" rx="5.5" ry="7" fill="${shade(skin, 0.08)}"/>`,
    `<ellipse cx="107" cy="73" rx="5.5" ry="7" fill="${shade(skin, 0.08)}"/>`,
    `<ellipse cx="80" cy="69" rx="26" ry="31" fill="url(#${gradientId}s)"/>`,
    // Cheek and jaw shading, kept very light: enough to give the face a shape.
    `<ellipse cx="80" cy="96" rx="17" ry="7" fill="${shade(skin, 0.1)}" opacity="0.5"/>`,
    `<path d="M63 59 Q70.5 55.5 78 58.5" stroke="${brow}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.9"/>`,
    `<path d="M82 58.5 Q89.5 55.5 97 59" stroke="${brow}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.9"/>`,
    // Almond eyes: a lid line over a small iris reads as a drawn eye, where a filled oval
    // reads as a dot.
    `<path d="M64 69 Q70.5 64.5 77 69 Q70.5 73.5 64 69 Z" fill="#ffffff" opacity="0.95"/>`,
    `<path d="M83 69 Q89.5 64.5 96 69 Q89.5 73.5 83 69 Z" fill="#ffffff" opacity="0.95"/>`,
    `<circle cx="70.5" cy="69" r="3" fill="#4a3b32"/>`,
    `<circle cx="89.5" cy="69" r="3" fill="#4a3b32"/>`,
    `<circle cx="70.5" cy="69" r="1.4" fill="#241c17"/>`,
    `<circle cx="89.5" cy="69" r="1.4" fill="#241c17"/>`,
    `<path d="M64 68.6 Q70.5 63.6 77 68.6" stroke="#3b2f28" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
    `<path d="M83 68.6 Q89.5 63.6 96 68.6" stroke="#3b2f28" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
    `<path d="M79 72 Q82.5 80 77.5 81.5" stroke="${shade(skin, 0.26)}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.85"/>`,
  ];

  if (beard) {
    parts.push(
      `<path d="M53 70 C 54 96 66 108 80 108 C 94 108 106 96 107 70 C 103 90 95 96 80 96 ` +
        `C 65 96 57 90 53 70 Z" fill="${shade(hairColour, -0.05)}" opacity="0.95"/>`
    );
  }

  parts.push(
    smiling
      ? `<path d="M73 88 Q80 92.5 87 88" stroke="${shade("#b5766a", 0.05)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      : `<path d="M74 89 Q80 90.6 86 89" stroke="${shade("#b5766a", 0.05)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
  );

  parts.push(hair.front);

  if (glasses) {
    parts.push(
      `<g fill="none" stroke="#4a4038" stroke-width="1.9" opacity="0.9">` +
        `<rect x="60" y="61" width="19" height="15" rx="6"/>` +
        `<rect x="81" y="61" width="19" height="15" rx="6"/>` +
        `<path d="M79 68 h2"/><path d="M60 66 l-7 2"/><path d="M100 66 l7 2"/></g>`
    );
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">` +
    parts.join("") +
    `</svg>`
  );
}
