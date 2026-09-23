/** "Kurucu Freelancer ol" call-out with the places left; renders nothing once they run out. */
export function FounderPromo({
  remaining,
  limit,
  className = "",
}: {
  remaining: number;
  limit: number;
  className?: string;
}) {
  if (remaining <= 0) return null;
  const taken = limit - remaining;

  return (
    <div className={`rounded-2xl border border-purple-200 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-5 ${className}`}>
      <p className="text-sm font-bold text-brand-navy">Kurucu Freelancer Ol</p>
      <p className="mt-1 text-sm text-slate-600">
        İlk ilanı onaylanan ilk {limit} freelancer; profilinde ve ilanlarında kalıcı{" "}
        <strong>Kurucu Freelancer</strong> rozeti taşır, ilanları aramalarda öne çıkar.
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600"
          style={{ width: `${Math.max(4, (taken / limit) * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs font-semibold text-purple-700">
        Kalan kontenjan: {remaining} / {limit}
      </p>
    </div>
  );
}
