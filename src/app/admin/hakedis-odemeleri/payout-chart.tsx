import { formatPrice } from "@/lib/format-price";

const MAX_BARS = 15;

/**
 * Ranked horizontal bar chart of total hakediş paid per freelancer, within
 * whatever date range the page's own filter is set to. One hue (the site's own
 * accent) since it is a single series — length carries the ranking, so no
 * legend or second color is needed. Capped at the top MAX_BARS; the full,
 * unaggregated list stays in the table below for anyone who needs the rest.
 */
export function PayoutByFreelancerChart({ payments }: { payments: { name: string; amount: number }[] }) {
  const totalsByName = new Map<string, number>();
  for (const p of payments) {
    totalsByName.set(p.name, (totalsByName.get(p.name) ?? 0) + p.amount);
  }

  const ranked = [...totalsByName.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  if (ranked.length === 0) return null;

  const top = ranked.slice(0, MAX_BARS);
  const max = top[0].amount;
  const hiddenCount = ranked.length - top.length;

  return (
    <figure className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <figcaption className="mb-4">
        <p className="text-sm font-semibold text-brand-navy">Freelancer Bazında Toplam Hakediş</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {hiddenCount > 0
            ? `En yüksek ${top.length} freelancer, tutara göre sıralı (${ranked.length} freelancer içinden).`
            : "Tutara göre sıralı."}
        </p>
      </figcaption>

      <div className="space-y-2.5">
        {top.map((row) => (
          <div key={row.name} className="flex items-center gap-3" title={`${row.name}: ${formatPrice(row.amount)}₺`}>
            <span className="w-32 shrink-0 truncate text-xs text-slate-600 sm:w-40" title={row.name}>
              {row.name}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="h-6 rounded-r bg-purple-600"
                style={{ width: `${max > 0 ? (row.amount / max) * 100 : 0}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-xs font-semibold text-brand-navy sm:w-28">
              {formatPrice(row.amount)}₺
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
