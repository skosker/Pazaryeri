const sizes = {
  /** Directory rows. */
  xs: "px-1.5 py-0.5 text-[9px]",
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

/** "Pro" / "Pro Plus" membership pill. `soft` is the quieter one used on gig cards. */
export function ProBadge({
  plus = false,
  size = "sm",
  soft = false,
}: {
  plus?: boolean;
  size?: keyof typeof sizes;
  soft?: boolean;
}) {
  const tone = soft
    ? plus
      ? "bg-amber-100 text-amber-800"
      : "bg-amber-50 text-amber-700"
    : plus
      ? "bg-gradient-to-r from-amber-300 to-orange-400 text-amber-950"
      : "bg-amber-400 text-amber-950";
  return (
    <span className={`inline-block w-fit whitespace-nowrap rounded-full font-bold uppercase tracking-wide ${sizes[size]} ${tone}`}>
      {plus ? "Pro Plus" : "Pro"}
    </span>
  );
}
