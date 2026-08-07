import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createOrder, OrderError } from "@/lib/orders";

export async function OrderPanel({
  slug,
  packageId,
  packageName,
  price,
  deliveryDays,
  revisionCount,
  description,
  isOwnGig,
}: {
  slug: string;
  packageId: string;
  packageName: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  description: string;
  isOwnGig: boolean;
}) {
  async function orderAction() {
    "use server";
    const session = await auth();
    if (!session?.user) {
      redirect(`/giris?callbackUrl=/gig/${slug}`);
    }

    try {
      const order = await createOrder(session.user.id, packageId);
      redirect(`/odeme/${order.id}`);
    } catch (error) {
      if (error instanceof OrderError) {
        redirect(`/gig/${slug}?hata=${encodeURIComponent(error.message)}`);
      }
      throw error;
    }
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-brand-navy">{packageName}</h2>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-brand-navy">{price}₺</span>
          <p className="text-xs text-slate-400">KDV dahil</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">{description}</p>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <ClockIcon /> {deliveryDays} gün teslim
        </span>
        <span className="flex items-center gap-1">
          <RefreshIcon /> {revisionCount} revizyon
        </span>
      </div>

      {isOwnGig ? (
        <p className="mt-5 rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-500">
          Bu senin ilanın
        </p>
      ) : (
        <form action={orderAction}>
          <button
            type="submit"
            className="brand-gradient mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Devam Et
          </button>
        </form>
      )}

      <button
        type="button"
        title="Yakında"
        disabled
        className="mt-3 w-full cursor-not-allowed rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-400"
      >
        Satıcıya Mesaj Gönder
      </button>

      <ul className="mt-5 space-y-2 text-xs text-slate-500">
        <li className="flex items-start gap-2">
          <CheckIcon /> Profestia güvencesiyle ödeme — iş onaylanmadan satıcıya aktarılmaz
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon /> Kredi kartına 3 taksit imkanı
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon /> 7/24 Türkçe destek
        </li>
      </ul>

      <p className="mt-4 text-center text-[11px] text-slate-400">
        Devam ederek{" "}
        <Link href="/kategoriler" className="underline">
          kullanım koşullarını
        </Link>{" "}
        kabul etmiş olursun.
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5.5 15a7 7 0 0012.7 2M18.5 9A7 7 0 005.8 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
