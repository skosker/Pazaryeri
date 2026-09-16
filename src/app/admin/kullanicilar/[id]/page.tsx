import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel, orderStatusColor } from "@/lib/order-status";
import { formatPrice } from "@/lib/format-price";
import { maskIban } from "@/lib/iban";

const roleLabel: Record<string, string> = {
  BUYER: "Alıcı",
  FREELANCER: "Freelancer",
  ADMIN: "Admin",
};

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

type OrderRow = {
  id: string;
  gigTitle: string;
  counterparty: string | null;
  amount: number;
  status: keyof typeof orderStatusLabel;
  createdAt: Date;
};

export default async function AdminUserDetailPage(props: PageProps<"/admin/kullanicilar/[id]">) {
  await requireAdmin();
  const { id } = await props.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      isPro: true,
      synthetic: true,
      emailVerified: true,
      createdAt: true,
      city: true,
      age: true,
      title: true,
      bio: true,
      skills: true,
      iban: true,
      ibanHolder: true,
    },
  });
  if (!user) notFound();

  const [gigs, ordersAsBuyer, ordersAsSeller] = await Promise.all([
    user.role === "FREELANCER"
      ? prisma.gig.findMany({
          where: { sellerId: id },
          include: {
            category: { select: { name: true } },
            packages: { orderBy: { price: "asc" }, take: 1 },
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.order.findMany({
      where: { buyerId: id },
      include: { gig: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    user.role === "FREELANCER"
      ? prisma.order.findMany({
          where: { gig: { sellerId: id } },
          include: { gig: { select: { title: true } }, buyer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
  ]);

  const buyerOrderRows: OrderRow[] = ordersAsBuyer.map((o) => ({
    id: o.id,
    gigTitle: o.gig.title,
    counterparty: null,
    amount: Number(o.amount),
    status: o.status,
    createdAt: o.createdAt,
  }));
  const sellerOrderRows: OrderRow[] = ordersAsSeller.map((o) => ({
    id: o.id,
    gigTitle: o.gig.title,
    counterparty: o.buyer.name,
    amount: Number(o.amount),
    status: o.status,
    createdAt: o.createdAt,
  }));

  return (
    <div>
      <Link href="/admin/kullanicilar" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Kullanıcılar
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-navy">{user.name}</h1>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {roleLabel[user.role] ?? user.role}
        </span>
        {user.isPro && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pro</span>
        )}
        {user.synthetic && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            Üretilmiş
          </span>
        )}
        {user.suspended && (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
            Askıya Alındı
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">{user.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Kayıt Tarihi" value={dateFmt.format(user.createdAt)} />
        <InfoCard
          label="E-posta"
          value={user.emailVerified ? `Doğrulandı (${dateFmt.format(user.emailVerified)})` : "Doğrulanmadı"}
        />
        <InfoCard label="Şehir" value={user.city ?? "—"} />
        <InfoCard label="Yaş" value={user.age ? String(user.age) : "—"} />
      </div>

      {user.role === "FREELANCER" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Ödeme Bilgisi</p>
          {user.iban ? (
            <p className="mt-1.5 font-mono text-sm text-brand-navy">
              {maskIban(user.iban)} <span className="font-sans text-slate-400">· {user.ibanHolder}</span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">IBAN girilmemiş</p>
          )}
          {user.title && <p className="mt-3 text-sm font-medium text-brand-navy">{user.title}</p>}
          {user.skills.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">{user.skills.join(" · ")}</p>
          )}
        </div>
      )}

      {user.bio && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Hakkında</p>
          <p className="mt-1.5 text-sm text-slate-600">{user.bio}</p>
        </div>
      )}

      {user.role === "FREELANCER" && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-navy">İlanları ({gigs.length})</h2>
          {gigs.length === 0 ? (
            <EmptyNote text="Henüz ilanı yok." />
          ) : (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">İlan</th>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 font-medium">Fiyat</th>
                    <th className="px-5 py-3 font-medium">Sipariş</th>
                    <th className="px-5 py-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.map((g) => (
                    <tr key={g.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 font-medium text-brand-navy">{g.title}</td>
                      <td className="px-5 py-3 text-slate-500">{g.category.name}</td>
                      <td className="px-5 py-3 text-slate-600">{formatPrice(g.packages[0]?.price ?? 0)}₺</td>
                      <td className="px-5 py-3 text-slate-500">{g._count.orders}</td>
                      <td className="px-5 py-3">
                        {g.published ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Yayında
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            Kaldırıldı
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {user.role === "FREELANCER" && (
        <OrderSection title={`Gelen Siparişler (${sellerOrderRows.length})`} orders={sellerOrderRows} counterpartyLabel="Alıcı" />
      )}

      <OrderSection title={`Verdiği Siparişler (${buyerOrderRows.length})`} orders={buyerOrderRows} counterpartyLabel="Satıcı" />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
      {text}
    </p>
  );
}

function OrderSection({
  title,
  orders,
  counterpartyLabel,
}: {
  title: string;
  orders: OrderRow[];
  counterpartyLabel: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      {orders.length === 0 ? (
        <EmptyNote text="Kayıt yok." />
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">İlan</th>
                {orders.some((o) => o.counterparty) && (
                  <th className="px-5 py-3 font-medium">{counterpartyLabel}</th>
                )}
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium text-right">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    <Link href={`/siparis/${o.id}`} className="hover:underline">
                      {o.gigTitle}
                    </Link>
                  </td>
                  {orders.some((row) => row.counterparty) && (
                    <td className="px-5 py-3 text-slate-500">{o.counterparty ?? "—"}</td>
                  )}
                  <td className="px-5 py-3 text-slate-500">{dateFmt.format(o.createdAt)}</td>
                  <td className="px-5 py-3 font-semibold text-brand-navy">{formatPrice(o.amount)}₺</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusColor[o.status]}`}>
                      {orderStatusLabel[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
