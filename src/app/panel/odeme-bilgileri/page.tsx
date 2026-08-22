import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatIban } from "@/lib/iban";
import { PayoutForm } from "./payout-form";
import { formatPrice } from "@/lib/format-price";

const statusLabels = {
  PENDING: { label: "Ödeme bekliyor", tone: "bg-amber-50 text-amber-700" },
  PAID: { label: "Ödendi", tone: "bg-emerald-50 text-emerald-700" },
  FAILED: { label: "Başarısız", tone: "bg-red-50 text-red-700" },
} as const;

export default async function PayoutDetailsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/odeme-bilgileri");
  if (session.user.role !== "FREELANCER") redirect("/panel");

  const [user, payouts] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { iban: true, ibanHolder: true },
    }),
    prisma.payout.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { order: { include: { gig: { select: { title: true } } } } },
    }),
  ]);

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.net), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Ödeme Bilgileri</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tamamlanan siparişlerin ödemesi bu hesaba havale edilir.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <PayoutForm iban={user.iban} ibanHolder={user.ibanHolder} />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-brand-navy">Hakedişler</h2>
          {pendingTotal > 0 && (
            <p className="text-sm text-slate-500">
              Ödeme bekleyen toplam:{" "}
              <span className="font-semibold text-brand-navy">{formatPrice(pendingTotal)}₺</span>
            </p>
          )}
        </div>

        {!user.iban && payouts.some((p) => p.status === "PENDING") && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Ödeme bekleyen hakedişin var ama IBAN kayıtlı değil. Havale yapılabilmesi için
            yukarıdaki bilgileri doldur.
          </p>
        )}

        {payouts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
            Henüz tamamlanmış siparişin yok.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const status = statusLabels[payout.status];
                  return (
                    <tr key={payout.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-4">
                        <p className="font-medium text-brand-navy">{payout.order.gig.title}</p>
                        <p className="text-xs text-slate-400">
                          #{payout.orderId.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand-navy">
                        {formatPrice(payout.net)}₺
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                          {status.label}
                        </span>
                        {payout.paidAt && (
                          <p className="mt-1 text-xs text-slate-400">
                            {payout.paidAt.toLocaleDateString("tr-TR")}
                          </p>
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

      {user.iban && (
        <p className="mt-6 text-xs text-slate-400">
          Kayıtlı hesap: {formatIban(user.iban)} · {user.ibanHolder}
        </p>
      )}
    </div>
  );
}
