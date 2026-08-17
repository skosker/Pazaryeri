// Emoji, matching the category icons. The keys are unchanged so the step, FAQ and
// trust-badge lists keep working as they are.
const emoji: Record<string, string> = {
  search: "🔍",
  "credit-card": "💳",
  clock: "⏳",
  "check-circle": "✅",
  "user-plus": "🙋",
  megaphone: "📣",
  bell: "🔔",
  banknote: "💰",
  "shield-check": "🛡️",
  refresh: "🔄",
  gift: "🎁",
};

/**
 * `className` sets the type size (e.g. `text-2xl`) rather than a box size, since the
 * glyph is text. Emoji ignore `currentColor`, so colour classes tint the tile behind
 * them but not the icon itself.
 */
export function StepIcon({ name, className = "text-xl" }: { name: string; className?: string }) {
  return (
    <span className={`inline-block leading-none ${className}`} role="img" aria-hidden>
      {emoji[name] ?? emoji.search}
    </span>
  );
}
