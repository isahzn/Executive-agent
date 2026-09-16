import type { TaxRuleSet } from "../types";

/**
 * Sri Lanka — Business (company) Tax, Year of Assessment 2025/2026.
 *
 * VERIFIED against the official Sri Lanka Inland Revenue Department (IRD)
 * 2025/2026 Tax Chart and the IRD Inland Revenue Act (as amended to 2025),
 * supplied by the project owner. Do not copy figures from third-party sites,
 * and do not treat these as current for any other tax year until a separately
 * verified IRD ruleset is added.
 *
 * Only the six rates below are verified. Additional concessions, exemptions,
 * thresholds, loss carry-forward, or expense-deductibility rules are
 * intentionally absent — they must be sourced from official IRD material
 * before being added. Each category carries its own rule so the special-rate
 * categories are explicit variants, and investment-asset gains are separately
 * calculated at their own rate. Expenses are attributed per category (Inland
 * Revenue Act s60(2) — each differently-taxed activity/source is a separate
 * business): an expense reduces only the income source it directly relates to,
 * and shared expenses are never silently allocated (the engine applies no
 * invented formula).
 */
export const SL_LK_BUSINESS_2025_26: TaxRuleSet = {
  id: "LK-business-2025-26",
  jurisdiction: "LK",
  country: "Sri Lanka",
  taxType: "BUSINESS",
  taxYear: "2025/2026",
  label: "Sri Lanka Business Tax — 2025/2026",
  effectiveFrom: "2025-04-01",
  effectiveTo: "2026-03-31",
  currency: "LKR",
  source: {
    authority: "Sri Lanka Inland Revenue Department",
    reference:
      "Official IRD 2025/2026 Tax Chart https://www.ird.gov.lk/en/publications/SitePages/tax_chart_2526.aspx; IRD Inland Revenue Act (2025 changes) https://www.ird.gov.lk/si/publications/Acts_Income%20Tax_2017/IRA_Cons_Act_-_2025_Changes.pdf.",
    description:
      "Official IRD company/business income tax rates for Year of Assessment 2025/2026.",
  },
  verified: true,
  description:
    "Standard company taxable income at 30%; qualifying foreign-currency service income remitted " +
    "through a bank at 15%; qualifying foreign-source income in foreign currency remitted through a " +
    "bank at 15%; betting and gaming at 45%; manufacture/import and sale of liquor or tobacco at 45%; " +
    "gains from realisation of investment assets at 30% (separately calculated). Loss carry-forward, " +
    "and any expense deductibility rule beyond per-source attribution, are not implemented.",
  rules: [
    {
      id: "LK-2025-26-business-standard-30",
      category: "BUSINESS_TAX",
      appliesTo: "STANDARD",
      kind: "FLAT_RATE",
      rate: 0.3,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Standard company taxable income.",
      reference: "IRD 2025/2026 Tax Chart — company (business) income tax.",
    },
    {
      id: "LK-2025-26-business-fxcy-service-15",
      category: "BUSINESS_TAX",
      appliesTo: "FXCY_SERVICE",
      kind: "FLAT_RATE",
      rate: 0.15,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Qualifying foreign-currency service income remitted through a bank.",
      reference: "IRD 2025/2026 Tax Chart — foreign-currency service income.",
    },
    {
      id: "LK-2025-26-business-fxcy-foreign-source-15",
      category: "BUSINESS_TAX",
      appliesTo: "FXCY_FOREIGN_SOURCE",
      kind: "FLAT_RATE",
      rate: 0.15,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Qualifying foreign-source income in foreign currency remitted through a bank.",
      reference: "IRD 2025/2026 Tax Chart — qualifying foreign-source income.",
    },
    {
      id: "LK-2025-26-business-betting-gaming-45",
      category: "BUSINESS_TAX",
      appliesTo: "BETTING_GAMING",
      kind: "FLAT_RATE",
      rate: 0.45,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Betting and gaming income.",
      reference: "IRD 2025/2026 Tax Chart — betting and gaming.",
    },
    {
      id: "LK-2025-26-business-liquor-tobacco-45",
      category: "BUSINESS_TAX",
      appliesTo: "LIQUOR_TOBACCO",
      kind: "FLAT_RATE",
      rate: 0.45,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Income from the manufacture/import and sale of liquor or tobacco.",
      reference: "IRD 2025/2026 Tax Chart — liquor and tobacco.",
    },
    {
      id: "LK-2025-26-business-investment-gains-30",
      category: "BUSINESS_TAX",
      appliesTo: "INVESTMENT_ASSET_GAINS",
      kind: "FLAT_RATE",
      rate: 0.3,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Gains from realisation of investment assets (separately calculated, no expense deduction).",
      reference: "IRD 2025/2026 Tax Chart / IRD Inland Revenue Act — investment asset gains.",
    },
  ],
};
