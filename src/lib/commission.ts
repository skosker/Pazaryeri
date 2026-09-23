/**
 * Prosinta's service fee, deducted from the freelancer's side when an order completes.
 * For now only the admin payout screen shows the breakdown; the freelancer sees just the
 * net amount they will be paid.
 */
export const COMMISSION_RATE = 0.025;
export const COMMISSION_LABEL = "%2,5";

export type PayoutSplit = { gross: number; commission: number; net: number };

/** Split an order amount into fee and payout, rounded to the kuruş. */
export function splitPayout(gross: number): PayoutSplit {
  const grossKurus = Math.round(gross * 100);
  const commissionKurus = Math.round(grossKurus * COMMISSION_RATE);
  return {
    gross: grossKurus / 100,
    commission: commissionKurus / 100,
    net: (grossKurus - commissionKurus) / 100,
  };
}
