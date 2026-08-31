import type { TaxRuleSet } from "../types";

/**
 * Sri Lanka Withholding Tax / Advance Income Tax (WHT/AIT) — Year of
 * Assessment 2025/2026.
 *
 * Verified against the official IRD 2025/2026 Tax Chart and the official WHT/AIT
 * schedules (Schedule 1 — interest/discount; Schedule 2A — payments to residents;
 * Schedule 2B — payments to non-residents), effective 01.04.2025. Only the
 * categories the owner verified are encoded. Finer conditions/exceptions inside
 * those schedules, and the 2025-03-28 IRD circular on interest AIT relief where
 * assessable income does not exceed the LKR 1,800,000 personal relief, are NOT
 * represented here (they require the official schedule/circular text).
 *
 * Rates are decimal fractions. A non-null `monthlyThreshold` is an exclusive
 * "exceeds" bound: when the aggregate payment in a calendar month exceeds it,
 * WHT is withheld on the full payment.
 */
export const SL_LK_WHT_2025_26: TaxRuleSet = {
  id: "sl-lk-wht-2025-26",
  jurisdiction: "LK",
  country: "Sri Lanka",
  taxType: "WITHHOLDING",
  taxYear: "2025/2026",
  label: "Sri Lanka Withholding Tax — 2025/2026",
  effectiveFrom: "2025-04-01",
  effectiveTo: "2026-03-31",
  currency: "LKR",
  source: {
    authority: "Inland Revenue Department of Sri Lanka",
    reference:
      "Official IRD 2025/2026 Tax Chart; WHT/AIT Schedule 1 (interest/discount), 2A (payments to residents), 2B (payments to non-residents), effective 01.04.2025",
    description:
      "Withholding Tax / Advance Income Tax rates for Year of Assessment 2025/2026, effective 01.04.2025.",
  },
  verified: true,
  description:
    "Official IRD Withholding Tax / AIT rates for Y/A 2025/2026. Covers the verified payment categories from the IRD Tax Chart; finer schedule conditions are not encoded.",
  rules: [
    {
      id: "LKA-WHT-NONRES-TRANSPORT-TELECOM",
      category: "WITHHOLDING_RATE",
      appliesTo: "NONRESIDENT_TRANSPORT_TELECOM",
      rate: 0.02,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Payment to a non-resident person for land, sea, air transport or telecommunication services (s85(2)).",
      reference: "IRD 2025/2026 Tax Chart; Inland Revenue Act s85(2)",
    },
    {
      id: "LKA-WHT-GEM-NGJA-AUCTION",
      category: "WITHHOLDING_RATE",
      appliesTo: "GEM_NGJA_AUCTION",
      rate: 0.025,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Sale price of any gem sold at an auction conducted by the National Gem & Jewellery Authority.",
      reference: "IRD 2025/2026 Tax Chart",
    },
    {
      id: "LKA-WHT-RESIDENT-SERVICE-FEE",
      category: "WITHHOLDING_RATE",
      appliesTo: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      rate: 0.05,
      monthlyThreshold: 100_000,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Service fee to a resident individual who is not an employee of the payer, where aggregate payment exceeds LKR 100,000 per calendar month — teaching/lecturing/examination, insurance/sales/canvassing commission, or specified independent-service-provider categories. 5% on the full payment when the threshold is exceeded.",
      reference: "IRD 2025/2026 Tax Chart; WHT/AIT Schedule 2A",
    },
    {
      id: "LKA-WHT-INTEREST-DISCOUNT",
      category: "WITHHOLDING_RATE",
      appliesTo: "INTEREST_DISCOUNT",
      rate: 0.1,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Interest or discount paid (AIT/WHT). The 2025-03-28 IRD circular on relief for resident individuals whose assessable income does not exceed the LKR 1,800,000 personal relief is not encoded here.",
      reference: "IRD 2025/2026 Tax Chart; WHT/AIT Schedule 1",
    },
    {
      id: "LKA-WHT-RENT-RESIDENT",
      category: "WITHHOLDING_RATE",
      appliesTo: "RENT_RESIDENT",
      rate: 0.1,
      monthlyThreshold: 100_000,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Rent payment to a resident person where the aggregate payment exceeds LKR 100,000 per calendar month. 10% on the full payment when the threshold is exceeded.",
      reference: "IRD 2025/2026 Tax Chart; WHT/AIT Schedule 2A",
    },
    {
      id: "LKA-WHT-LOTTERY-BETTING-WINNINGS",
      category: "WITHHOLDING_RATE",
      appliesTo: "LOTTERY_BETTING_WINNINGS",
      rate: 0.14,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Winnings from a lottery, reward, betting or gambling.",
      reference: "IRD 2025/2026 Tax Chart",
    },
    {
      id: "LKA-WHT-CHARGE-NATURAL-RESOURCE",
      category: "WITHHOLDING_RATE",
      appliesTo: "CHARGE_NATURAL_RESOURCE_PREMIUM",
      rate: 0.14,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Charge, natural-resource payment or premium.",
      reference: "IRD 2025/2026 Tax Chart",
    },
    {
      id: "LKA-WHT-ROYALTY",
      category: "WITHHOLDING_RATE",
      appliesTo: "ROYALTY",
      rate: 0.14,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Royalty.",
      reference: "IRD 2025/2026 Tax Chart",
    },
    {
      id: "LKA-WHT-RENT-NONRESIDENT",
      category: "WITHHOLDING_RATE",
      appliesTo: "RENT_NONRESIDENT",
      rate: 0.14,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Rent payment to a non-resident person.",
      reference: "IRD 2025/2026 Tax Chart; WHT/AIT Schedule 2B",
    },
    {
      id: "LKA-WHT-SERVICE-INSURANCE-NONRESIDENT",
      category: "WITHHOLDING_RATE",
      appliesTo: "SERVICE_FEE_INSURANCE_NONRESIDENT",
      rate: 0.14,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Service fee or insurance-premium payment to a non-resident person.",
      reference: "IRD 2025/2026 Tax Chart; WHT/AIT Schedule 2B",
    },
    {
      id: "LKA-WHT-DIVIDENDS",
      category: "WITHHOLDING_RATE",
      appliesTo: "DIVIDENDS",
      rate: 0.15,
      monthlyThreshold: null,
      effectiveFrom: "2025-04-01",
      effectiveTo: null,
      note: "Dividends.",
      reference: "IRD 2025/2026 Tax Chart",
    },
  ],
};
