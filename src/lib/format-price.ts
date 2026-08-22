/**
 * Tutarların ekrandaki biçimi: 12500 → "12.500", 12500.5 → "12.500,50".
 *
 * Prices are stored as Decimal, so the value arrives here as a number, a string or a
 * Prisma Decimal; all three are read the same way. Kuruş only shows when there is any —
 * a listing at 12.500₺ should not read "12.500,00₺".
 */
export function formatPrice(value: number | string | { toString(): string } | null | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0";

  const hasKurus = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: hasKurus ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
