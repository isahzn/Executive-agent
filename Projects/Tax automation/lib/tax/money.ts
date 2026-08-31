import type { Currency } from "./types";

const SYMBOLS: Record<Currency, string> = { LKR: "LKR" };

/** Format a whole-currency amount for display, e.g. 2700000 → "LKR 2,700,000". */
export function formatMoney(amount: number, currency: Currency = "LKR"): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(Math.round(amount));
  return `${sign}${SYMBOLS[currency]} ${abs.toLocaleString("en-US")}`;
}

/** Format a decimal rate for display, e.g. 0.18 → "18%". */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 1)}%`;
}
