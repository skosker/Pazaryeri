import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { confirmTopUpAction, rejectTopUpAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Start of the current month in Istanbul, as an instant. */
function monthStart(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit" }).format(now);
  return new Date(`${parts}-01T00:00:00+03:00`);
}

export default async function AdminCorporatePage() {
  const since = monthStart();
  const [settings, pending, companies, spending] = await Promise.all([
    getSettings(),
    prisma.balanceTopUp.findMany({
      where: { status: "INITIALIZED" },
      include: { user: { select: { name: true, email: true, companyName: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { companyName: { not: null } },
      select: { id: true, name: true, email: true, companyName: true, taxOffice: true, taxNumber: true, balance: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.balanceEntry.groupBy({
      by: ["userId"],
      where: { kind: "ORDER", createdAt: { gte: since } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);
  const spentBy = new Map(spending.map((s) => [s.userId, { total: -Number(s._sum.amount ?? 0), count: s._count }]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Kurumsal Hesaplar</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Bakiye yükleme bildirimleri ve kurumsal hesapların bu ayki harcaması (aylık tek fatura/ekstre için).{" "}
        {settings.corporateEnabled ? (
          <span className="font-semibold text-emerald-700">Kurumsal paket açık.</span>
        ) : (
          <span className="font-semibold text-amber-700">
            Kurumsal paket kapalı — kullanıcılar görmüyor.{" "}
            <Link href="/admin/ayarlar" className="underline">
              Ayarlardan aç
            </Link>
          </span>
        )}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-brand-navy">Onay Bekleyen Yüklemeler ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Onay bekleyen yükleme yok.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Şirket</th>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-navy">{t.user.companyName}</p>
                      <p className="text-xs text-slate-400">{t.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{dateFmt.format(t.createdAt)}</td>
                    <td className="px-5 py-4 font-semibold text-brand-navy">
                      {formatPrice(t.amount)}₺
                      {Number(t.bonus) > 0 && <span className="block text-xs font-normal text-emerald-700">+{formatPrice(t.bonus)}₺ bonus</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <form action={confirmTopUpAction.bind(null, t.id)}>
                          <button className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700">
                            Onayla
                          </button>
                        </form>
                        <form action={rejectTopUpAction.bind(null, t.id)}>
                          <button className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            Reddet
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Kurumsal Hesaplar · {monthFmt.format(new Date())} Harcaması
        </h2>
        {companies.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Henüz kurumsal hesap yok.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Şirket</th>
                  <th className="px-5 py-3 font-medium">Vergi</th>
                  <th className="px-5 py-3 font-medium">Bakiye</th>
                  <th className="px-5 py-3 font-medium">Bu Ay</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const spent = spentBy.get(c.id);
                  return (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-4">
                        <Link href={`/admin/kullanicilar/${c.id}`} className="font-medium text-brand-navy hover:underline">
                          {c.companyName}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {c.name} · {c.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {c.taxOffice} · {c.taxNumber}
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand-navy">{formatPrice(c.balance)}₺</td>
                      <td className="px-5 py-4 text-slate-600">
                        {spent ? `${formatPrice(spent.total)}₺ (${spent.count} sipariş)` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
