/**
 * "Kurucu Freelancer ol" call-out; renders nothing once the places run out. How many are
 * left is deliberately not shown — it would tell visitors how many real freelancers there are.
 */
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

  return (
    <div className={`rounded-2xl border border-purple-200 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-5 ${className}`}>
      <p className="text-sm font-bold text-brand-navy">Kurucu Freelancer Ol</p>
      <p className="mt-1 text-sm text-slate-600">
        İlk ilanı onaylanan ilk {limit.toLocaleString("tr-TR")} freelancer; profilinde ve ilanlarında kalıcı{" "}
        <strong>Kurucu Freelancer</strong> rozeti taşır, ilanları aramalarda öne çıkar.
      </p>
      <p className="mt-2 text-xs font-semibold text-purple-700">Sınırlı kontenjan — ilk {limit.toLocaleString("tr-TR")} freelancer&apos;a özel</p>
    </div>
  );
}
