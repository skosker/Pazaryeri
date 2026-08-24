export type BankTransferInfo = {
  accountHolder: string;
  iban: string;
  bankName: string;
};

// Prosinta'nın havale/EFT hesabı. Ortam değişkenleri tanımlıysa onlar geçerli olur;
// boş bırakılırsa aşağıdaki gerçek hesap bilgileri gösterilir.
export const bankTransferInfo: BankTransferInfo = {
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || "Prosinta Dijital Teknolojiler A.Ş.",
  iban: process.env.BANK_IBAN || "TR87 0006 2000 7060 0006 2946 11",
  bankName: process.env.BANK_NAME || "Garanti Bankası",
};
