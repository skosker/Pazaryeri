/** Turkish IBANs are always TR plus 24 digits, 26 characters in total. */
const TR_IBAN_LENGTH = 26;

/** Strips spaces and upper-cases, which is how an IBAN should be stored. */
export function normalizeIban(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** "TR12 3456 7890 1234 5678 9012 34" — grouped by four for display. */
export function formatIban(value: string) {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Validates the ISO 13616 check digits: move the first four characters to the end,
 * map letters to numbers (A=10 … Z=35) and the whole thing read as an integer must
 * leave a remainder of 1 modulo 97. The number is far beyond Number.MAX_SAFE_INTEGER,
 * so the remainder is taken digit by digit.
 */
function checksumHolds(iban: string) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;

  for (const char of rearranged) {
    const value = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of value) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

/** Returns an error message, or null when the IBAN is usable. */
export function validateTurkishIban(raw: string): string | null {
  const iban = normalizeIban(raw);

  if (!iban) return "IBAN girin";
  if (!iban.startsWith("TR")) return "IBAN 'TR' ile başlamalı";
  if (iban.length !== TR_IBAN_LENGTH) {
    return `IBAN 26 karakter olmalı (şu an ${iban.length})`;
  }
  if (!/^TR\d{24}$/.test(iban)) return "IBAN, TR'den sonra yalnızca rakam içermeli";
  if (!checksumHolds(iban)) return "IBAN geçersiz — rakamları kontrol et";

  return null;
}
