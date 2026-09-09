import { normalizeIban } from "@/lib/iban";

/**
 * A Turkish IBAN encodes the bank itself: "TR" + 2 check digits + a 5-digit bank code +
 * 1 reserved digit + a 16-digit account number. The bank code is TCMB/BKM's own
 * published interbank clearing code, so it identifies the real bank — nothing here is
 * guessed from the freelancer's name or any other field.
 *
 * Only codes we can name with confidence are listed; an unrecognized code is shown as
 * itself (see bankNameFromIban) rather than a guess.
 */
const bankNameByCode: Record<string, string> = {
  "00010": "Ziraat Bankası",
  "00012": "Halkbank",
  "00015": "VakıfBank",
  "00032": "TEB",
  "00046": "Akbank",
  "00062": "Garanti BBVA",
  "00064": "İş Bankası",
  "00067": "Yapı Kredi",
  "00111": "QNB Finansbank",
  "00123": "HSBC",
  "00134": "Denizbank",
  "00143": "ING",
  "00203": "Kuveyt Türk",
};

export function bankCodeFromIban(iban: string): string {
  return normalizeIban(iban).slice(4, 9);
}

/** The bank's name, or "Banka Kodu 00829" for a code outside the table above. */
export function bankNameFromIban(iban: string): string {
  const code = bankCodeFromIban(iban);
  return bankNameByCode[code] ?? `Banka Kodu ${code}`;
}
