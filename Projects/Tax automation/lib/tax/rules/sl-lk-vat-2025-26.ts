import type { TaxRuleSet } from "../types";

/**
 * Sri Lanka — Value Added Tax, Year of Assessment 2025/2026.
 *
 * VERIFIED against the official Sri Lanka Inland Revenue Department (IRD)
 * material supplied by the project owner: the IRD Value Added Tax page, the
 * IRD Tax Chart, the consolidated Value Added Tax Act, and IRD Gazette
 * Extraordinary No. 2443/30 dated 2025-07-01 (non-resident electronic-platform
 * services). Do not copy figures from third-party sites, and do not treat these
 * as current for any other tax year until a separately-verified IRD ruleset is
 * added.
 *
 * Only the rules below are verified. Additional exemptions, special rates,
 * categories, or input-tax eligibility *legal* rules are intentionally absent —
 * they must be sourced from official IRD material before being added.
 *
 * Effective dates: the standard rate applies from 2024-01-01, the financial
 * services rate from 2022-01-01, and the non-resident electronic-platform rule
 * from 2025-10-01. The zero-rated/export rate, the standard & financial
 * registration thresholds, and the special registration rules are stable
 * provisions of the VAT regime and are aligned to the current standard-rate
 * window (2024-01-01) as their governing date was not separately specified.
 */
export const SL_LK_VAT_2025_26: TaxRuleSet = {
  id: "LK-vat-2025-26",
  jurisdiction: "LK",
  country: "Sri Lanka",
  taxType: "VAT",
  taxYear: "2025/2026",
  label: "Sri Lanka VAT — 2025/2026",
  effectiveFrom: "2025-04-01",
  effectiveTo: "2026-03-31",
  currency: "LKR",
  source: {
    authority: "Sri Lanka Inland Revenue Department",
    reference:
      "IRD Value Added Tax page; IRD Tax Chart; consolidated Value Added Tax Act; IRD Gazette Extraordinary No. 2443/30 of 2025-07-01.",
    description:
      "Official IRD VAT figures for Year of Assessment 2025/2026.",
  },
  verified: true,
  description:
    "Standard VAT rate 18% (goods/services other than financial services); zero-rated supplies (exports) at 0%; " +
    "financial services at 18%. Mandatory registration above the applicable turnover thresholds, with voluntary " +
    "registration for persons carrying out taxable supplies and mandatory registration for commercial importers/exporters. " +
    "From 2025-10-01 VAT applies to taxable services supplied by a non-resident person through an electronic platform.",
  rules: [
    {
      id: "LK-2025-26-vat-rate-standard",
      category: "VAT_RATE",
      appliesTo: "STANDARD",
      rate: 0.18,
      effectiveFrom: "2024-01-01",
      effectiveTo: null,
      note: "Standard VAT rate on supplies of goods and services other than financial services.",
      reference: "IRD Value Added Tax page / IRD Tax Chart.",
    },
    {
      id: "LK-2025-26-vat-rate-financial-services",
      category: "VAT_RATE",
      appliesTo: "FINANCIAL_SERVICES",
      rate: 0.18,
      effectiveFrom: "2022-01-01",
      effectiveTo: null,
      note: "VAT on financial services.",
      reference: "IRD value added tax page — financial services.",
    },
    {
      id: "LK-2025-26-vat-rate-zero-rated",
      category: "VAT_RATE",
      appliesTo: "ZERO_RATED",
      rate: 0,
      effectiveFrom: "2024-01-01",
      effectiveTo: null,
      note: "Zero-rated supplies — the IRD specifically identifies exports as zero-rated.",
      reference: "Consolidated Value Added Tax Act (zero-rated supplies).",
    },
    {
      id: "LK-2025-26-vat-threshold-standard",
      category: "VAT_REGISTRATION_THRESHOLD",
      appliesTo: "STANDARD",
      quarterly: 15_000_000,
      annual: 60_000_000,
      effectiveFrom: "2024-01-01",
      effectiveTo: null,
      note: "Mandatory registration for ordinary taxable supplies other than financial services when turnover exceeds LKR 15,000,000 in a quarter or LKR 60,000,000 over 12 months (exclusive).",
      reference: "Consolidated Value Added Tax Act.",
    },
    {
      id: "LK-2025-26-vat-threshold-financial-services",
      category: "VAT_REGISTRATION_THRESHOLD",
      appliesTo: "FINANCIAL_SERVICES",
      quarterly: 3_000_000,
      annual: 12_000_000,
      effectiveFrom: "2022-01-01",
      effectiveTo: null,
      note: "Mandatory registration for financial services when turnover exceeds LKR 3,000,000 per quarter or LKR 12,000,000 per annum (exclusive).",
      reference: "Consolidated Value Added Tax Act.",
    },
    {
      id: "LK-2025-26-vat-threshold-eplatform",
      category: "VAT_REGISTRATION_THRESHOLD",
      appliesTo: "NON_RESIDENT_EPLATFORM",
      quarterly: 15_000_000,
      annual: 60_000_000,
      effectiveFrom: "2025-10-01",
      effectiveTo: null,
      note: "Non-resident electronic-platform suppliers to Sri Lanka: registration when turnover exceeds LKR 15,000,000 within the last three months or LKR 60,000,000 within the last twelve months (exclusive).",
      reference: "IRD Gazette Extraordinary No. 2443/30 dated 2025-07-01.",
    },
    {
      id: "LK-2025-26-vat-reg-voluntary",
      category: "VAT_SPECIAL_REGISTRATION",
      kind: "VOLUNTARY_AVAILABLE",
      effectiveFrom: "2024-01-01",
      effectiveTo: null,
      note: "Voluntary registration is available regardless of the registration threshold for persons carrying out taxable supplies.",
      reference: "Consolidated Value Added Tax Act.",
    },
    {
      id: "LK-2025-26-vat-reg-import-export",
      category: "VAT_SPECIAL_REGISTRATION",
      kind: "IMPORT_EXPORT_MANDATORY",
      effectiveFrom: "2024-01-01",
      effectiveTo: null,
      note: "Persons importing or exporting goods for commercial purposes are required to register under the VAT Act regardless of turnover thresholds or exemptions.",
      reference: "Consolidated Value Added Tax Act.",
    },
  ],
};
