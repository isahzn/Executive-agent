/**
 * Deterministic rounding for money. All tax amounts are whole LKR (integer
 * rupees). Band tax is computed as the integer rupee amount, rounded to the
 * nearest rupee, so results are reproducible and free of float drift.
 */

/** Round an amount to the nearest whole rupee (0.5 up). */
export function roundToRupee(amount: number): number {
  return Math.round(amount);
}

/** Compute the tax on a band's amount at a given decimal rate, rounded up to the rupee. */
export function taxOnBand(amountInBand: number, rate: number): number {
  return roundToRupee(amountInBand * rate);
}
