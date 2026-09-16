/**
 * Seed the dev JSON history store with the USER_GUIDE demo-run calculations,
 * computed by the real deterministic engine. Everything shown in the dashboard
 * and history screenshots is a genuine engine output, not fabricated data.
 *
 * Run: npx tsx scripts/seed-demo-history.ts
 */

import fs from "node:fs/promises";
import path from "node:path";

import {
  getRuleSet,
  calculateIndividualIncomeTax,
  calculateVat as calculateVatEngine,
  calculateWithholding as calculateWithholdingEngine,
  calculateBusinessTax as calculateBusinessTaxEngine,
} from "../lib/tax/index.js";

type Calc = {
  id: string;
  type: string;
  taxYear: string;
  atDate: string;
  rulesetId: string;
  input: unknown;
  result: unknown;
  user: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "calculations.json");

function id(n: number): string {
  // Stable, realistic-looking ids (same shape as randomUUID).
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += hex[(n * 7 + i * 13) % 16];
  }
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function stamped(daysAgo: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 24, 0, 0);
  return d.toISOString();
}

const individual = getRuleSet({
  jurisdiction: "LK",
  taxType: "INDIVIDUAL_INCOME",
  taxYear: "2025/2026",
});
const vat = getRuleSet({ jurisdiction: "LK", taxType: "VAT", taxYear: "2025/2026" });
const wht = getRuleSet({
  jurisdiction: "LK",
  taxType: "WITHHOLDING",
  taxYear: "2025/2026",
});
const business = getRuleSet({
  jurisdiction: "LK",
  taxType: "BUSINESS",
  taxYear: "2025/2026",
});

if (!individual || !vat || !wht || !business) {
  console.error("Verified 2025/2026 rulesets not found - aborting (nothing written).");
  process.exit(1);
}

const indInput = {
  employmentIncome: 5_000_000,
  businessIncome: 0,
  investmentIncome: 0,
  otherIncome: 0,
  allowableDeductions: 0,
  investmentAssetGains: 0,
};
const indResult = calculateIndividualIncomeTax(indInput, individual);
if (indResult.totalTax !== 672_000) {
  console.error(`Engine mismatch: individual totalTax ${indResult.totalTax} != 672000 - aborting.`);
  process.exit(1);
}

const vatInput = {
  standardRatedSales: 1_000_000,
  zeroRatedSales: 0,
  financialServicesSales: 0,
  deductibleInputVat: 80_000,
  nonDeductibleInputVat: 0,
};
const vatResult = calculateVatEngine(vatInput, vat);
if (vatResult.netVat !== 100_000) {
  console.error(`Engine mismatch: netVat ${vatResult.netVat} != 100000 - aborting.`);
  process.exit(1);
}

const whtInput = {
  category: "DIVIDENDS" as const,
  gross: 1_000_000,
  monthlyAggregate: undefined,
};
const whtResult = calculateWithholdingEngine(whtInput, wht, "2025-04-01");
if (whtResult.withholding !== 150_000) {
  console.error(`Engine mismatch: withholding ${whtResult.withholding} != 150000 - aborting.`);
  process.exit(1);
}

const bizInput = {
  standardIncome: 1_000_000,
  foreignCcyServiceIncome: 0,
  foreignCcyForeignSourceIncome: 0,
  bettingGamingIncome: 200_000,
  liquorTobaccoIncome: 0,
  investmentAssetGains: 0,
  ordinaryExpenses: 400_000,
  foreignCcyServiceExpenses: 0,
  foreignCcyForeignSourceExpenses: 0,
  bettingGamingExpenses: 0,
  liquorTobaccoExpenses: 0,
  sharedExpenses: 0,
};
const bizResult = calculateBusinessTaxEngine(bizInput, business, "2025-04-01");
if (bizResult.totalTax !== 270_000) {
  console.error(`Engine mismatch: business totalTax ${bizResult.totalTax} != 270000 - aborting.`);
  process.exit(1);
}

const calcs: Calc[] = [
  {
    id: id(1),
    type: "INDIVIDUAL_INCOME",
    taxYear: individual.taxYear,
    atDate: individual.effectiveFrom,
    rulesetId: individual.id,
    input: indInput,
    result: indResult,
    user: "local",
    createdAt: stamped(2, 14),
  },
  {
    id: id(2),
    type: "BUSINESS",
    taxYear: business.taxYear,
    atDate: business.effectiveFrom,
    rulesetId: business.id,
    input: bizInput,
    result: bizResult,
    user: "local",
    createdAt: stamped(2, 15),
  },
  {
    id: id(3),
    type: "VAT",
    taxYear: vat.taxYear,
    atDate: "2025-10-01",
    rulesetId: vat.id,
    input: vatInput,
    result: vatResult,
    user: "local",
    createdAt: stamped(1, 9),
  },
  {
    id: id(4),
    type: "WITHHOLDING",
    taxYear: wht.taxYear,
    atDate: wht.effectiveFrom,
    rulesetId: wht.id,
    input: whtInput,
    result: whtResult,
    user: "local",
    createdAt: stamped(0, 11),
  },
];

(async () => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(calcs, null, 2), "utf-8");
  console.log(`Seeded ${calcs.length} engine-computed calculations -> ${DATA_FILE}`);
})();
