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
 * The active company accounts a buyer is shown at checkout, oldest first. Accounts can be
 * tied to a Prosinta job category: an order pays into the accounts of its gig's category.
 * Without a category (Pro, corporate and balance payments), or when that category has no
 * active account, the "Genel" accounts (no category) are shown; failing those, every active
 * account; failing that, the single built-in account, so checkout always has something to
 * show. A deactivated account (admin's "Pasife Al") is never shown but not deleted either.
 */
export async function getBankAccounts(categoryId?: string | null): Promise<BankTransferInfo[]> {
  const rows = await prisma.bankAccount.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  const inCategory = categoryId ? rows.filter((row) => row.categoryId === categoryId) : [];
  const general = rows.filter((row) => row.categoryId === null);
  const shown = inCategory.length ? inCategory : general.length ? general : rows;
  if (shown.length === 0) return [fallback];

  return shown.map((row) => ({
    id: row.id,
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    iban: formatIban(row.iban),
  }));
}

export type AdminBankAccount = BankTransferInfo & {
  active: boolean;
  category: { id: string; name: string } | null;
};

/** Every company account — active and inactive — for the /admin/banka management screen. */
export async function getAllBankAccountsForAdmin(): Promise<AdminBankAccount[]> {
  const rows = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: { select: { id: true, name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    accountHolder: row.accountHolder,
    bankName: row.bankName,
    iban: formatIban(row.iban),
    active: row.active,
    category: row.category,
  }));
}
