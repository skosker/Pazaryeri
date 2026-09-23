/**
 * Prosinta's service fee, deducted from the freelancer's side when an order completes.
 * The rate is set at /admin/ayarlar. For now only the admin payout screen shows the
 * breakdown; the freelancer sees just the net amount they will be paid.
 */
export type PayoutSplit = { gross: number; commission: number; net: number };

/** Split an order amount into fee and payout, rounded to the kuruş. `percent` 2.5 = %2,5. */
export function splitPayout(gross: number, percent: number): PayoutSplit {
  const grossKurus = Math.round(gross * 100);
  const commissionKurus = Math.round((grossKurus * percent) / 100);
  return {
    gross: grossKurus / 100,
    commission: commissionKurus / 100,
    net: (grossKurus - commissionKurus) / 100,
  };
}
