// Categories are shown as emoji. The keys are the values stored in Category.icon,
// kept from the previous icon set so existing rows and the admin picker still match.
const emoji: Record<string, string> = {
  cpu: "🤖",
  code: "💻",
  palette: "🎨",
  megaphone: "📣",
  chart: "📊",
  briefcase: "💼",
  pen: "✍️",
  video: "🎬",
  book: "🎓",
  music: "🎵",
  sparkles: "✨",
};

export const CATEGORY_EMOJI_KEYS = Object.keys(emoji);

/**
 * `className` sets the type size (e.g. `text-lg`) rather than a box size, since the
 * glyph is text. Emoji ignore `currentColor`, so surrounding accent classes tint the
 * tile behind them but not the icon itself.
 */
export function CategoryIcon({ icon, className = "text-xl" }: { icon: string; className?: string }) {
  return (
    <span className={`inline-block leading-none ${className}`} role="img" aria-hidden>
      {emoji[icon] ?? emoji.sparkles}
    </span>
  );
}
