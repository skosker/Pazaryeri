import { getAllBankAccountsForAdmin } from "@/lib/bank-transfer";
import { addBankAccountAction, deleteBankAccountAction, toggleBankAccountActiveAction } from "./actions";
import { AddBankAccountForm } from "./bank-account-form";

export default async function AdminBankAccountPage() {
  const persisted = await getAllBankAccountsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Banka Hesapları</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Havale/EFT ile ödeyen alıcıya ödeme sayfasında gösterilen şirket hesapları. Birden
        çok ekleyebilirsin; alıcı kendi bankasına denk geleni seçip masrafsız EFT yapar.
        Buradaki değişiklikler anında geçerli olur, yeni bir dağıtım gerekmez.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-brand-navy">Yeni Hesap Ekle</p>
        <AddBankAccountForm action={addBankAccountAction} />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Ekli hesaplar ({persisted.length})
        </p>

        {persisted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            Henüz hesap eklenmedi. Yukarıdan ekleyene kadar ödeme sayfası koddaki varsayılan
            hesabı gösterir.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Hesap Sahibi</th>
                  <th className="px-5 py-3 font-medium">Banka</th>
                  <th className="px-5 py-3 font-medium">IBAN</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {persisted.map((account) => (
                  <tr
                    key={account.id}
                    className={`border-b border-slate-100 last:border-0 ${account.active ? "" : "opacity-60"}`}
                  >
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {account.accountHolder}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{account.bankName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{account.iban}</td>
                    <td className="px-5 py-3">
                      {account.active ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <form action={toggleBankAccountActiveAction.bind(null, account.id)}>
                          <button
                            type="submit"
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              account.active
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {account.active ? "Pasife Al" : "Aktif Et"}
                          </button>
                        </form>
                        <form action={deleteBankAccountAction.bind(null, account.id)}>
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Kaldır
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
      </div>

      <p className="mt-4 max-w-2xl text-xs text-slate-400">
        Alıcı ödemeyi yaptıktan sonra &quot;Ödeme Bildirimi Yap&quot; diyor; bildirimler
        Havale/EFT Onayları ekranına düşüyor.
      </p>
    </div>
  );
}
