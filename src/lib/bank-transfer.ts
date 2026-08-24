import { prisma } from "@/lib/prisma";
import { formatIban } from "@/lib/iban";

/**
 * The account a buyer paying by bank transfer is told to send money to.
 *
 * There is one of these for the whole platform, kept in a single `bank_accounts` row so
 * an admin can change it from /admin/banka without a deploy. The environment variables
 * below are the local-development escape hatch — with no row and no variables set, the
 * built-in values are the account the site actually uses.
 *
 * Read this on the server and pass the result down. It used to be a plain module-level
 * object read straight from `process.env`, which quietly broke once a client component
 * imported it: variables without the NEXT_PUBLIC_ prefix are not in the browser bundle,
 * so `process.env.BANK_IBAN` was `undefined` there and the fallback was all anyone saw.
 */

export type BankTransferInfo = {
  accountHolder: string;
  bankName: string;
  /** Grouped by four for display: "TR87 0006 …". */
  iban: string;
};

const fallback: BankTransferInfo = {
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || "Prosinta Dijital Teknolojiler A.Ş.",
  bankName: process.env.BANK_NAME || "Garanti Bankası",
  iban: process.env.BANK_IBAN || "TR87 0006 2000 7060 0006 2946 11",
};

export const BANK_ACCOUNT_ID = "default";

export async function getBankTransferInfo(): Promise<BankTransferInfo> {
  const row = await prisma.bankAccount.findUnique({ where: { id: BANK_ACCOUNT_ID } });
  if (!row) return { ...fallback, iban: formatIban(fallback.iban) };

  return {
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    iban: formatIban(row.iban),
  };
}
