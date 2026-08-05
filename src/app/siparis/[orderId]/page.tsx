import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrderForUser } from "@/lib/order-actions";
import { orderStatusLabel, orderStatusColor } from "@/lib/order-status";
import { ReviewForm } from "./review-form";
import { startOrderAction, deliverOrderAction, completeOrderAction } from "./actions";

const timelineSteps = [
  { key: "PAID", label: "Ödendi" },
  { key: "IN_PROGRESS", label: "Devam Ediyor" },
  { key: "DELIVERED", label: "Teslim Edildi" },
  { key: "COMPLETED", label: "Tamamlandı" },
] as const;

export default async function OrderDetailPage(props: PageProps<"/siparis/[orderId]">) {
  const { orderId } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/siparis/${orderId}`);

  const order = await getOrderForUser(orderId, session.user.id);
  if (!order) notFound();

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.gig.sellerId === session.user.id;
  const currentStepIndex = timelineSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/panel" className="hover:text-brand-navy">
          Panelim
        </Link>{" "}
        / <span className="text-slate-500">Sipariş Detayı</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{order.gig.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.package.name} · {isBuyer ? `Satıcı: ${order.gig.seller.name}` : `Alıcı: ${order.buyer.name}`}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${orderStatusColor[order.status]}`}>
          {orderStatusLabel[order.status]}
        </span>
      </div>

      {order.status === "PENDING_PAYMENT" && isBuyer && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">Bu siparişin ödemesi henüz tamamlanmadı.</p>
          <Link
            href={`/odeme/${order.id}`}
            className="brand-gradient mt-3 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Ödemeyi Tamamla
          </Link>
        </div>
      )}

      {order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED" && (
        <ol className="mt-8 flex items-center gap-2">
          {timelineSteps.map((step, i) => (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i <= currentStepIndex ? "brand-gradient text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs ${i <= currentStepIndex ? "text-brand-navy" : "text-slate-400"}`}>
                {step.label}
              </span>
              {i < timelineSteps.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Tutar</span>
          <span className="font-semibold text-brand-navy">{Number(order.amount)}₺</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Teslim süresi</span>
          <span className="font-semibold text-brand-navy">{order.package.deliveryDays} gün</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Ödeme durumu</span>
          <span className="font-semibold text-brand-navy">
            {order.escrowReleased ? "Satıcıya aktarıldı" : "iyzico güvencesinde bekletiliyor"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {isSeller && order.status === "PAID" && (
          <form action={startOrderAction.bind(null, order.id)}>
            <button
              type="submit"
              className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Siparişi Onayla ve İşe Başla
            </button>
          </form>
        )}

        {isSeller && order.status === "IN_PROGRESS" && (
          <form action={deliverOrderAction.bind(null, order.id)}>
            <button
              type="submit"
              className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Teslim Et
            </button>
          </form>
        )}

        {isBuyer && order.status === "DELIVERED" && (
          <form action={completeOrderAction.bind(null, order.id)}>
            <button
              type="submit"
              className="brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Teslimatı Onayla ve Ödemeyi Serbest Bırak
            </button>
          </form>
        )}
      </div>

      {isBuyer && order.status === "COMPLETED" && (
        <div className="mt-8">
          {order.review ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-semibold text-brand-navy">Değerlendirmen</p>
              <p className="mt-1 text-amber-400">{"★".repeat(order.review.rating)}</p>
              <p className="mt-1 text-sm text-slate-600">{order.review.comment}</p>
            </div>
          ) : (
            <ReviewForm orderId={order.id} />
          )}
        </div>
      )}
    </div>
  );
}
