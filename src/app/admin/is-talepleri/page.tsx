import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format-price";
import { budgetLabel, isOpen } from "@/lib/job-requests";
import { removeJobRequestAction } from "./actions";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

const FILTERS = [
  { key: "", label: "Tümü" },
  { key: "acik", label: "Açık" },
  { key: "secildi", label: "Freelancer Seçildi" },
  { key: "kaldirildi", label: "Kaldırılan" },
] as const;

function statusOf(r: { status: string; expiresAt: Date }) {
  if (r.status === "REMOVED") return { label: "Kaldırıldı", tone: "bg-red-50 text-red-700" };
  if (r.status === "HIRED") return { label: "Freelancer seçildi", tone: "bg-purple-50 text-purple-700" };
  if (isOpen(r)) return { label: "Açık", tone: "bg-emerald-50 text-emerald-700" };
  return { label: r.status === "CLOSED" ? "Kapatıldı" : "Süresi doldu", tone: "bg-slate-100 text-slate-500" };
}

export default async function AdminJobRequestsPage(props: PageProps<"/admin/is-talepleri">) {
  const query = await props.searchParams;
  const filter = typeof query.durum === "string" ? query.durum : "";
  const now = new Date();
  const where =
    filter === "acik"
      ? { status: "OPEN" as const, expiresAt: { gt: now } }
      : filter === "secildi"
        ? { status: "HIRED" as const }
        : filter === "kaldirildi"
          ? { status: "REMOVED" as const }
          : {};

  const [settings, requests, totals] = await Promise.all([
    getSettings(),
    prisma.jobRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, title: true, description: true, budgetMin: true, budgetMax: true, status: true, expiresAt: true, createdAt: true,
        category: { select: { name: true } },
        buyer: { select: { id: true, name: true, email: true } },
        offers: { where: { status: { not: "WITHDRAWN" } }, select: { status: true, price: true } },
      },
    }),
    prisma.jobRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => totals.find((t) => t.status === s)?._count ?? 0;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">İş Talepleri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Alıcıların açtığı talepler anında yayına girer; uygunsuz olanı buradan kaldır.
          </p>
        </div>
        <Link href="/admin/ayarlar" className="text-sm font-semibold text-purple-700 hover:underline">
          Ayarlar →
        </Link>
      </div>

      <p
        className={`mt-4 rounded-xl px-4 py-3 text-sm ${
          settings.jobRequestsEnabled ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {settings.jobRequestsEnabled ? (
          <>
            Özellik <strong>açık</strong>: talep yayın süresi {settings.jobRequestDays} gün; aylık teklif hakkı Ücretsiz{" "}
            {settings.offerQuotaFree}, Pro {settings.offerQuotaPro}, Pro Plus {settings.offerQuotaPlus}.
          </>
        ) : (
          <>
            Özellik <strong>kapalı</strong>: sitede görünmüyor. Açmak için Üyelik ve Gelir Ayarları → Bireysel → İş Talepleri.
          </>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Toplam", totals.reduce((sum, t) => sum + t._count, 0)],
          ["Açık / Kapanan", `${count("OPEN")} / ${count("CLOSED")}`],
          ["Freelancer seçildi", count("HIRED")],
          ["Kaldırılan", count("REMOVED")],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-brand-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/is-talepleri?durum=${f.key}` : "/admin/is-talepleri"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === f.key ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          Bu filtrede talep yok.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Talep</th>
                <th className="px-4 py-3 font-medium">Alıcı</th>
                <th className="px-4 py-3 font-medium">Bütçe</th>
                <th className="px-4 py-3 font-medium">Teklif</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const s = statusOf(r);
                const accepted = r.offers.find((o) => o.status === "ACCEPTED");
                return (
                  <tr key={r.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="max-w-md px-4 py-3">
                      <Link href={`/is-talepleri/${r.id}`} className="font-semibold text-brand-navy hover:underline">
                        {r.title}
                      </Link>
                      <p className="line-clamp-2 text-xs text-slate-500">{r.description}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {r.category.name} · {dateFmt.format(r.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/kullanicilar/${r.buyer.id}`} className="text-brand-navy hover:underline">
                        {r.buyer.name}
                      </Link>
                      <p className="text-xs text-slate-400">{r.buyer.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{budgetLabel(r.budgetMin, r.budgetMax)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.offers.length}
                      {accepted && (
                        <p className="text-xs text-purple-700">Kabul: {formatPrice(Number(accepted.price))} TL</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${s.tone}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== "REMOVED" && r.status !== "HIRED" && (
                        <form action={removeJobRequestAction.bind(null, r.id)}>
                          <button className="text-xs font-semibold text-red-600 hover:underline">Kaldır</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
