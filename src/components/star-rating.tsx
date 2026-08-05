export function StarRating({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
      </svg>
      <span className="font-semibold text-brand-navy">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-slate-400">({count})</span>
      )}
    </div>
  );
}
