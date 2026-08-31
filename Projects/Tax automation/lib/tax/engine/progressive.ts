import type { BandResult, TaxRule } from "../types";
import { taxOnBand } from "./rounding";

/**
 * Apply an ordered set of progressive bands to a taxable amount, allocating
 * each rupee to exactly one band. Bands must be contiguous and sorted by
 * `lower` ascending; the final "balance" band has `upper === null` and absorbs
 * the remainder. Returns one BandResult per band (only bands actually reached
 * are emitted) plus the total tax.
 */
export function applyProgressiveBands(
  taxableAmount: number,
  bands: Extract<TaxRule, { category: "PROGRESSIVE_BAND" }>[]
): { bands: BandResult[]; total: number } {
  const results: BandResult[] = [];

  if (taxableAmount <= 0) {
    return { bands: results, total: 0 };
  }

  const sorted = [...bands].sort((a, b) => a.lower - b.lower);
  let remaining = taxableAmount;

  for (const band of sorted) {
    if (remaining <= 0) break;

    const bandSize =
      band.upper === null ? remaining : band.upper - band.lower;
    const amountInBand = Math.max(0, Math.min(remaining, bandSize));

    if (amountInBand <= 0) continue;

    const tax = taxOnBand(amountInBand, band.rate);
    results.push({
      lower: band.lower,
      upper: band.upper,
      rate: band.rate,
      amountInBand,
      tax,
    });
    remaining -= amountInBand;
  }

  const total = results.reduce((sum, b) => sum + b.tax, 0);
  return { bands: results, total };
}
