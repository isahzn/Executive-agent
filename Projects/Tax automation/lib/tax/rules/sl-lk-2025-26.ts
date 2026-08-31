import type { TaxRuleSet } from "../types";

/**
 * Sri Lanka — Individual Income Tax, Year of Assessment 2025/2026.
 *
 * VERIFIED against the official Sri Lanka Inland Revenue Department (IRD)
 * 2025/2026 Tax Chart and the IRD notice on amendments to the Inland Revenue
 * Act, as supplied by the project owner. Do not copy figures from third-party
 * sites, and do not treat these as current for any other tax year until a
 * separately-verified IRD ruleset is added.
 */
export const SL_LK_INDIVIDUAL_2025_26: TaxRuleSet = {
  id: "LK-individual-2025-26",
  jurisdiction: "LK",
  country: "Sri Lanka",
  taxType: "INDIVIDUAL_INCOME",
  taxYear: "2025/2026",
  label: "Sri Lanka Individual Income Tax — 2025/2026",
  effectiveFrom: "2025-04-01",
  effectiveTo: "2026-03-31",
  currency: "LKR",
  source: {
    authority: "Sri Lanka Inland Revenue Department",
    reference: "IRD 2025/2026 Tax Chart & IRD notice on Inland Revenue Act amendments",
    description: "Official IRD figures for Year of Assessment 2025/2026.",
  },
  verified: true,
  description:
    "Personal relief LKR 1,800,000 for resident individuals and non-resident citizens of Sri Lanka; " +
    "normal progressive bands up to 36%; separate 10% rate on gains from realisation of investment assets. " +
    "The personal relief does not apply against gains from realisation of investment assets.",
  rules: [
    {
      id: "LK-2025-26-personal-relief",
      category: "PERSONAL_RELIEF",
      amount: 1_800_000,
      excludes: "INVESTMENT_ASSET_GAINS",
      note: "Resident individuals and non-resident citizens of Sri Lanka.",
    },
    {
      id: "LK-2025-26-band-1",
      category: "PROGRESSIVE_BAND",
      lower: 0,
      upper: 1_000_000,
      rate: 0.06,
      note: "First LKR 1,000,000 at 6%.",
    },
    {
      id: "LK-2025-26-band-2",
      category: "PROGRESSIVE_BAND",
      lower: 1_000_000,
      upper: 1_500_000,
      rate: 0.18,
      note: "Next LKR 500,000 at 18%.",
    },
    {
      id: "LK-2025-26-band-3",
      category: "PROGRESSIVE_BAND",
      lower: 1_500_000,
      upper: 2_000_000,
      rate: 0.24,
      note: "Next LKR 500,000 at 24%.",
    },
    {
      id: "LK-2025-26-band-4",
      category: "PROGRESSIVE_BAND",
      lower: 2_000_000,
      upper: 2_500_000,
      rate: 0.3,
      note: "Next LKR 500,000 at 30%.",
    },
    {
      id: "LK-2025-26-band-5",
      category: "PROGRESSIVE_BAND",
      lower: 2_500_000,
      upper: null,
      rate: 0.36,
      note: "Balance at 36%.",
    },
    {
      id: "LK-2025-26-investment-asset-gains",
      category: "FLAT_RATE",
      rate: 0.1,
      appliesTo: "INVESTMENT_ASSET_GAINS",
      note: "Gains from realisation of investment assets at 10%.",
    },
  ],
};
