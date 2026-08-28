import { prisma } from "@/lib/prisma";
import { formatIban } from "@/lib/iban";

/**
 * The company accounts a buyer paying by bank transfer can send money to.
 *
 * There can be several — an admin adds and removes them at /admin/banka — so a buyer can
 * pick the one at their own bank and make a free, instant EFT. The environment variables
 * below are the local-development escape hatch: with no rows and no variables set, the
 * built-in values are shown as a single account.
 *
 * Read this on the server and pass the result down. It must not be imported by a client
 * component: variables without the NEXT_PUBLIC_ prefix are not in the browser bundle, so
 * `process.env.BANK_IBAN` would be `undefined` there and only the fallback would show.
 */

export type BankTransferInfo = {
  id: string;
  accountHolder: string;
  bankName: string;
  /** Grouped by four for display: "TR87 0006 …". */
  iban: string;
};

const fallback: BankTransferInfo = {
  id: "fallback",
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || "Prosinta Dijital Teknolojiler A.Ş.",
  bankName: process.env.BANK_NAME || "Garanti Bankası",
  iban: formatIban(process.env.BANK_IBAN || "TR870006200070600006294611"),
};

/**
 * Every active company account, oldest first — what the checkout page shows. A
 * deactivated account (admin's "Pasife Al") is excluded here but not deleted, so it can
 * be turned back on later without re-entering its details. Falls back to a single
 * built-in account when no active rows exist, so checkout always has something to show.
 */
export async function getBankAccounts(): Promise<BankTransferInfo[]> {
  const rows = await prisma.bankAccount.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return [fallback];

  return rows.map((row) => ({
    id: row.id,
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    iban: formatIban(row.iban),
  }));
}

export type AdminBankAccount = BankTransferInfo & { active: boolean };

/** Every company account — active and inactive — for the /admin/banka management screen. */
export async function getAllBankAccountsForAdmin(): Promise<AdminBankAccount[]> {
  const rows = await prisma.bankAccount.findMany({ orderBy: { createdAt: "asc" } });

  return rows.map((row) => ({
    id: row.id,
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    iban: formatIban(row.iban),
    active: row.active,
  }));
}
