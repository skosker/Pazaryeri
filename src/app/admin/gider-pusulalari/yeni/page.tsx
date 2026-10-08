import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VoucherForm } from "../voucher-form";

/** A new gider pusulası; the stopaj rate starts at the one used last time. */
export default async function NewExpenseVoucherPage() {
  const last = await prisma.expenseVoucher.findFirst({
    orderBy: { number: "desc" },
    select: { withholdingPercent: true },
  });
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date());

  return (
    <div className="max-w-4xl">
      <Link href="/admin/gider-pusulalari" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← Gider Pusulaları
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-navy">Yeni Gider Pusulası</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Prosinta&apos;nın kendi ihtiyacı için, vergi mükellefi olmayan bir kişiden fiilen alınan iş için düzenlenir.
        Tarih, işin yapıldığı ve ödemenin yapıldığı gündür. Pazaryerindeki siparişler bu belgeyle belgelenmez.
      </p>
      <div className="mt-6">
        <VoucherForm today={today} defaultPercent={last ? Number(last.withholdingPercent).toLocaleString("tr-TR") : ""} />
      </div>
    </div>
  );
}
