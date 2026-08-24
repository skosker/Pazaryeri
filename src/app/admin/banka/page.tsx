import { getBankTransferInfo } from "@/lib/bank-transfer";
import { saveBankAccountAction } from "./actions";
import { BankAccountForm } from "./bank-account-form";

export default async function AdminBankAccountPage() {
  const current = await getBankTransferInfo();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Banka Hesabı</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Havale/EFT ile ödeyen alıcıya ödeme sayfasında gösterilen hesap. Burada kaydedilen
        bilgiler anında geçerli olur; yeni bir dağıtım gerekmez.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BankAccountForm action={saveBankAccountAction} current={current} />
      </div>

      <p className="mt-4 max-w-2xl text-xs text-slate-400">
        Alıcı ödemeyi yaptıktan sonra &quot;Ödeme Bildirimi Yap&quot; diyor; bildirimler
        Havale/EFT Onayları ekranına düşüyor.
      </p>
    </div>
  );
}
