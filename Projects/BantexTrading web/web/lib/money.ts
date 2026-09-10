// Single source for the store currency. LKR per the existing "Rs." display.
export const CURRENCY = "LKR";

// Price strings in products are authored like "Rs. 60". This formats a minor-unit
// (cents) value the same way for derived amounts (line subtotals, cart total).
export function formatPriceMinor(minor: number): string {
  const hasCents = minor % 100 !== 0;
  const rupees = (minor / 100).toLocaleString("en-LK", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `Rs. ${rupees}`;
}

// Convert a major-unit amount to cents before sending to Stripe.
export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}
