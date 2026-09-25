import { requireAdmin } from "@/lib/require-admin";
import { formatPrice } from "@/lib/format-price";
import { costs, income, monthlyRevenue, type RevenueMonth } from "@/lib/revenue";

const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });
const label = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 15)));
};
const tl = (n: number) => (n === 0 ? "—" : `${formatPrice(n)} TL`);

function sum(rows: RevenueMonth[]): RevenueMonth {
  const total = { month: "toplam" } as RevenueMonth;
  for (const key of Object.keys(rows[0]) as (keyof RevenueMonth)[]) {
    if (key === "month") continue;
    (total[key] as number) = Math.round(rows.reduce((s, r) => s + (r[key] as number), 0) * 100) / 100;
  }
  return total;
}

function Tile({ title, value, hint, tone = "text-brand-navy" }: { title: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{title}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function RevenuePage() {
  await requireAdmin();
  const rows = await monthlyRevenue(12);
  const current = rows[0];
  const year = sum(rows);
  const net = (m: RevenueMonth) => income(m) - costs(m);

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-brand-navy">Gelir Raporu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Prosinta&apos;nın kendi geliri ve karşıladığı indirimler, İstanbul takvim ayına göre. Tutarlar tahsil edildiği
        gibi (KDV dahil); sipariş hacmi freelancer&apos;lara giden paranın toplamıdır, gelir değildir.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile title={`Gelir · ${label(current.month)}`} value={`${formatPrice(income(current))} TL`} />
        <Tile
          title="Karşılanan indirimler"
          value={`${formatPrice(costs(current))} TL`}
          hint="İlk sipariş, davet, kurumsal indirim, bonus"
          tone="text-rose-600"
        />
        <Tile
          title="Net"
          value={`${formatPrice(net(current))} TL`}
          tone={net(current) < 0 ? "text-rose-600" : "text-emerald-700"}
        />
        <Tile
          title="Sipariş hacmi"
          value={`${formatPrice(current.orderVolume)} TL`}
          hint={`${current.orderCount} ödenmiş sipariş`}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Ay</th>
              <th className="px-3 py-3 font-medium">Pro Üyelik</th>
              <th className="px-3 py-3 font-medium">Kurumsal Paket</th>
              <th className="px-3 py-3 font-medium">Öne Çıkar</th>
              <th className="px-3 py-3 font-medium">Komisyon</th>
              <th className="px-3 py-3 font-medium text-brand-navy">Gelir</th>
              <th className="px-3 py-3 font-medium">İndirimler</th>
              <th className="px-3 py-3 font-medium text-brand-navy">Net</th>
              <th className="px-4 py-3 font-medium">Sipariş Hacmi</th>
            </tr>
          </thead>
          <tbody>
            {[...rows, year].map((m) => {
              const isTotal = m.month === "toplam";
              const n = net(m);
              return (
                <tr
                  key={m.month}
                  className={`border-b border-slate-100 last:border-0 ${isTotal ? "bg-slate-50 font-semibold" : ""}`}
                >
                  <td className="px-4 py-2.5 text-left text-slate-600">{isTotal ? "Son 12 ay" : label(m.month)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{tl(m.membership)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{tl(m.corporatePlans)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{tl(m.boosts)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{tl(m.commission)}</td>
                  <td className="px-3 py-2.5 font-semibold text-brand-navy">{tl(income(m))}</td>
                  <td
                    className="px-3 py-2.5 text-rose-600"
                    title={`İlk sipariş ${formatPrice(m.firstOrderDiscounts)} · Davet ${formatPrice(m.referralCredits)} · Kurumsal ${formatPrice(m.corporateDiscounts)} · Bonus ${formatPrice(m.topUpBonuses)} TL`}
                  >
                    {costs(m) === 0 ? "—" : `−${formatPrice(costs(m))} TL`}
                  </td>
                  <td className={`px-3 py-2.5 font-semibold ${n < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {income(m) === 0 && costs(m) === 0 ? "—" : `${formatPrice(n)} TL`}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {tl(m.orderVolume)}
                    {m.orderCount > 0 && <span className="block text-[11px] text-slate-400">{m.orderCount} sipariş</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-4">
        <p>İlk sipariş indirimi (12 ay): <strong className="text-slate-700">{formatPrice(year.firstOrderDiscounts)} TL</strong></p>
        <p>Davet ödülleri: <strong className="text-slate-700">{formatPrice(year.referralCredits)} TL</strong></p>
        <p>Kurumsal indirimler: <strong className="text-slate-700">{formatPrice(year.corporateDiscounts)} TL</strong></p>
        <p>Bakiye bonusları: <strong className="text-slate-700">{formatPrice(year.topUpBonuses)} TL</strong></p>
      </div>
    </div>
  );
}
