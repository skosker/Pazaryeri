import { prisma } from "@/lib/prisma";
import { formatIban } from "@/lib/iban";
import { CopyIban } from "./copy-iban";

export default async function FreelancerIbansPage() {
  const list = await prisma.freelancerIban.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Freelancer IBAN&apos;ları</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Freelancer hakediş IBAN&apos;ları. Bu liste yalnızca admin panelinde görünür; herkese
        açık dizinde ya da profillerde yer almaz.
      </p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {list.length} kayıt
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Freelancer</th>
              <th className="px-5 py-3 font-medium">IBAN</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4 font-medium text-brand-navy">{row.name}</td>
                <td className="px-5 py-4 font-mono text-xs text-slate-600 sm:text-sm">
                  {formatIban(row.iban)}
                </td>
                <td className="px-5 py-4 text-right">
                  <CopyIban iban={row.iban} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
