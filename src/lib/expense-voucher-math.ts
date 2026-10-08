/**
 * Gider pusulası arithmetic — line totals, withholding, the sıra no label and the amount in
 * words. No database access, so the admin form can use it in the browser too.
 */

export const VOUCHER_SERIES = "GP";

export type VoucherItem = {
  description: string;
  /** "Cinsi": unit or kind of the work, e.g. "Adet", "Saat", "Tasarım". */
  kind: string;
  quantity: number;
  unitPrice: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function lineTotal(item: Pick<VoucherItem, "quantity" | "unitPrice">): number {
  return round2(item.quantity * item.unitPrice);
}

/** Gross from the lines, the income-tax withholding at `percent`, and what is paid out. */
export function voucherTotals(items: Pick<VoucherItem, "quantity" | "unitPrice">[], percent: number) {
  const gross = round2(items.reduce((sum, item) => sum + lineTotal(item), 0));
  const withholding = round2((gross * percent) / 100);
  return { gross, withholding, net: round2(gross - withholding) };
}

/** "000042": the sıra no as printed. */
export const voucherNumberLabel = (n: number) => String(n).padStart(6, "0");

const ONES = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
const TENS = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
const SCALES = ["", "Bin", "Milyon", "Milyar"];

function belowThousand(n: number): string[] {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const words: string[] = [];
  if (h) words.push(...(h > 1 ? [ONES[h]] : []), "Yüz");
  if (t) words.push(TENS[t]);
  if (o) words.push(ONES[o]);
  return words;
}

function integerInWords(n: number): string {
  if (n === 0) return "Sıfır";
  const words: string[] = [];
  let scale = 0;
  while (n > 0) {
    const group = n % 1000;
    if (group) {
      // Turkish says "Bin", not "Bir Bin".
      const part = scale === 1 && group === 1 ? [] : belowThousand(group);
      words.unshift(...part, ...(SCALES[scale] ? [SCALES[scale]] : []));
    }
    n = Math.floor(n / 1000);
    scale++;
  }
  return words.join(" ");
}

/** 1234.5 → "Bin İki Yüz Otuz Dört Türk Lirası Elli Kuruş", for the "Yalnız" line. */
export function amountInWords(amount: number): string {
  const kurus = Math.round(amount * 100);
  const lira = Math.floor(kurus / 100);
  const rest = kurus % 100;
  return `${integerInWords(lira)} Türk Lirası${rest ? ` ${integerInWords(rest)} Kuruş` : ""}`;
}
