// Core domain types for the deterministic tax system.
//
// The tax engine is the SOURCE OF TRUTH for all tax calculations.
// These types are shared across the engine, rules layer, calculators,
// and (read-only) the UI. Tax values are NEVER hard-coded in components.

/** ISO-3166 alpha-2 jurisdiction code. */
export type Jurisdiction = "LK";

/** Categories of tax supported by the engine. */
export type TaxType = "INDIVIDUAL_INCOME" | "BUSINESS" | "VAT" | "WITHHOLDING";

/** Supported currencies. Amounts are integer minor-units where relevant. */
export type Currency = "LKR";

/** Supply categories that attract (or are liable to) output VAT. */
export type VatSupplyCategory =
  | "STANDARD"
  | "ZERO_RATED"
  | "FINANCIAL_SERVICES";

/** Supply categories that carry a VAT registration-threshold rule. */
export type VatRegistrationCategory =
  | "STANDARD"
  | "FINANCIAL_SERVICES"
  | "NON_RESIDENT_EPLATFORM";

/** Special, non-rate VAT registration rules. */
export type VatSpecialRegistrationKind =
  | "VOLUNTARY_AVAILABLE"
  | "IMPORT_EXPORT_MANDATORY";

/**
 * Income categories a Sri Lankan company may earn, each attracting a distinct
 * verified business-tax rate. Income is taxed per category. Expenses are
 * attributable per category: each expense reduces only the income source it
 * relates to (IRC s60(2) — an activity/source taxed at a different rate is a
 * separate business). Investment-asset gains are computed on gross and are
 * never reduced by business expenses.
 */
export type BusinessIncomeCategory =
  | "STANDARD"
  | "FXCY_SERVICE"
  | "FXCY_FOREIGN_SOURCE"
  | "BETTING_GAMING"
  | "LIQUOR_TOBACCO"
  | "INVESTMENT_ASSET_GAINS";

/** Outcome of a VAT registration-threshold assessment. */
export type VatRegistrationStatus =
  | "MANDATORY"
  | "VOLUNTARY"
  | "NOT_REQUIRED";

/** Net VAT position after crediting deductible input VAT. */
export type VatPosition = "PAYABLE" | "REFUNDABLE" | "NIL";

/**
 * Payment / income categories subject to Sri Lanka WHT/AIT. Each entry maps to
 * one verified WITHHOLDING_RATE rule in the ruleset (rate + optional monthly
 * threshold). Only the categories the owner verified are listed.
 */
export type WhtPaymentCategory =
  | "NONRESIDENT_TRANSPORT_TELECOM"
  | "GEM_NGJA_AUCTION"
  | "RESIDENT_NON_EMPLOYEE_SERVICE_FEE"
  | "INTEREST_DISCOUNT"
  | "RENT_RESIDENT"
  | "LOTTERY_BETTING_WINNINGS"
  | "CHARGE_NATURAL_RESOURCE_PREMIUM"
  | "ROYALTY"
  | "RENT_NONRESIDENT"
  | "SERVICE_FEE_INSURANCE_NONRESIDENT"
  | "DIVIDENDS";

/**
 * A single structured tax rule. Rules are data, not code: the engine picks
 * them up dynamically so new tax years / jurisdictions are data additions,
 * never a rewrite of the calculation logic.
 *
 * `category` drives how the engine interprets the rule:
 *  - PERSONAL_RELIEF    a flat amount deducted from assessable income.
 *  - PROGRESSIVE_BAND   a bracket with a lower bound, optional upper bound,
 *                       and a rate. The balance band has `upper === null`.
 *  - FLAT_RATE          a single rate applied to a specific income category
 *                       (e.g. gains from realisation of investment assets).
 */
export type TaxRule =
  | {
      id: string;
      category: "PERSONAL_RELIEF";
      /** Amount in whole currency units (LKR). */
      amount: number;
      /** Optional restriction of which income the relief applies to. */
      excludes?: "INVESTMENT_ASSET_GAINS";
      note?: string;
    }
  | {
      id: string;
      category: "PROGRESSIVE_BAND";
      /** Inclusive lower bound (whole currency units). */
      lower: number;
      /** Exclusive upper bound, or null for the "balance" band. */
      upper: number | null;
      /** Rate as a decimal fraction, e.g. 0.06 for 6%. */
      rate: number;
      note?: string;
    }
  | {
      id: string;
      category: "FLAT_RATE";
      /** Rate as a decimal fraction, e.g. 0.10 for 10%. */
      rate: number;
      /** The income component the rate applies to. */
      appliesTo: "INVESTMENT_ASSET_GAINS";
      note?: string;
    }
  | {
      id: string;
      category: "VAT_RATE";
      /** Rate as a decimal fraction, e.g. 0.18 for 18%. */
      rate: number;
      /** The supply category the rate applies to. */
      appliesTo: VatSupplyCategory;
      /** ISO date the rate takes effect (inclusive). */
      effectiveFrom: string;
      /** ISO date the rate ceases, or null if still in force. */
      effectiveTo: string | null;
      note?: string;
      reference?: string;
    }
  | {
      id: string;
      category: "VAT_REGISTRATION_THRESHOLD";
      /** The supply category the threshold applies to. */
      appliesTo: VatRegistrationCategory;
      /** Exclusive "more than" bound for a single quarter (whole LKR), or null if n/a. */
      quarterly: number | null;
      /** Exclusive "more than" bound for a 12-month/annum period (whole LKR), or null if n/a. */
      annual: number | null;
      /** Effective date (ISO). */
      effectiveFrom: string;
      /** Effective-to (ISO), or null if still in force. */
      effectiveTo: string | null;
      note?: string;
      reference?: string;
    }
  | {
      id: string;
      category: "VAT_SPECIAL_REGISTRATION";
      kind: VatSpecialRegistrationKind;
      effectiveFrom: string;
      effectiveTo: string | null;
      note?: string;
      reference?: string;
    }
  | {
      id: string;
      category: "WITHHOLDING_RATE";
      /** The payment/income category the rate applies to. */
      appliesTo: WhtPaymentCategory;
      /** Rate as a decimal fraction, e.g. 0.05 for 5%. */
      rate: number;
      /** Exclusive monthly "exceeds" bound in whole LKR, or null when no threshold applies. */
      monthlyThreshold: number | null;
      /** ISO date the rate takes effect (inclusive). */
      effectiveFrom: string;
      /** ISO date the rate ceases, or null if still in force. */
      effectiveTo: string | null;
      note?: string;
      reference?: string;
    }
  | {
      id: string;
      category: "BUSINESS_TAX";
      /** The income category this rate applies to (one rule per category). */
      appliesTo: BusinessIncomeCategory;
      /**
       * How the verified rate applies to the category's income. Currently the
       * only modelled structure is a single flat rate on the category's taxable
       * income — the shape a Sri Lankan corporate/company income tax liability
       * takes. Future structures (progressive bands, sector-specific tiers,
       * qualifying deductions) extend this via new `kind` values, not a rewrite.
       */
      kind: "FLAT_RATE";
      /** Rate as a decimal fraction, e.g. 0.30 for 30%. */
      rate: number;
      /** ISO date the rate takes effect (inclusive). */
      effectiveFrom: string;
      /** ISO date the rate ceases, or null if still in force. */
      effectiveTo: string | null;
      note?: string;
      reference?: string;
    };

/** Authority + reference for a ruleset, for auditability. */
export interface TaxRuleSource {
  authority: string;
  reference: string;
  url?: string;
  description?: string;
}

/**
 * A complete, versioned set of tax rules for one jurisdiction + tax type +
 * tax year. Historical sets are retained so a past calculation stays
 * reproducible; new years are added as new sets, never by editing old ones.
 */
export interface TaxRuleSet {
  id: string;
  jurisdiction: Jurisdiction;
  country: string;
  taxType: TaxType;
  taxYear: string;
  label: string;
  effectiveFrom: string; // ISO date (YYYY-MM-DD)
  effectiveTo: string; // ISO date (YYYY-MM-DD)
  currency: Currency;
  source: TaxRuleSource;
  /** True only when the figures were verified against an official source. */
  verified: boolean;
  /** Human note describing the ruleset / confidence. */
  description?: string;
  rules: TaxRule[];
}

/** Selector used to resolve a ruleset. */
export interface TaxRuleSelector {
  jurisdiction: Jurisdiction;
  taxType: TaxType;
  taxYear: string;
}

// --- Individual Income Tax inputs & results -------------------------------

/** Inputs to the Individual Income Tax calculator, in whole LKR. */
export interface IndividualIncomeInput {
  employmentIncome: number;
  businessIncome: number;
  investmentIncome: number;
  otherIncome: number;
  /** Qualifying allowable deductions / allowances (reduces assessable income). */
  allowableDeductions: number;
  /** Gains from realisation of investment assets (own 10% rate, no relief). */
  investmentAssetGains: number;
}

/** One computed progressive band in the breakdown. */
export interface BandResult {
  lower: number;
  upper: number | null;
  rate: number;
  amountInBand: number;
  tax: number;
}

/** A single audit-trail step explaining the maths (AI-free). */
export interface AuditStep {
  label: string;
  amount: number;
  detail?: string;
}

/** Full result of an Individual Income Tax calculation. */
export interface IndividualIncomeResult {
  input: IndividualIncomeInput;
  currency: Currency;
  ordinaryAssessableIncome: number;
  taxableAfterRelief: number;
  /** The full personal relief available under the ruleset (e.g. LKR 1,800,000). */
  personalRelief: number;
  /** The amount of personal relief actually applied (capped at assessable income). */
  personalReliefApplied: number;
  bands: BandResult[];
  bandTax: number;
  investmentAssetGains: number;
  investmentGainsRate: number;
  investmentGainsTax: number;
  totalTax: number;
  effectiveRate: number;
  ruleset: {
    id: string;
    taxYear: string;
    jurisdiction: Jurisdiction;
    source: TaxRuleSource;
    verified: boolean;
    label: string;
  };
  audit: AuditStep[];
}

// --- VAT inputs & results ------------------------------------------------

/** Inputs to the VAT calculation, in whole LKR (amounts) unless noted. */
export interface VatInput {
  /** Taxable supplies of goods/services other than financial services. */
  standardRatedSales: number;
  /** Zero-rated supplies (exports), liable at 0%. */
  zeroRatedSales: number;
  /** Supplies of financial services, liable at the financial-services rate. */
  financialServicesSales: number;
  /** Input VAT the taxpayer claims as a credit (deductible). */
  deductibleInputVat: number;
  /** Input VAT NOT deductible — recorded but never credited. */
  nonDeductibleInputVat: number;
}

/** One computed supply category in the VAT breakdown. */
export interface VatCategoryResult {
  category: VatSupplyCategory;
  /** Rate applied, as a decimal fraction. */
  rate: number;
  /** Supply value in whole LKR. */
  amount: number;
  /** Output VAT for this category. */
  outputVat: number;
}

/** Calculated output/input/net VAT with a transparent breakdown. */
export interface VatCalculationResult {
  input: VatInput;
  currency: Currency;
  categories: VatCategoryResult[];
  /** Total output VAT across all supply categories. */
  outputVat: number;
  /** VAT that can be credited against output VAT. */
  creditableInputVat: number;
  /** VAT that cannot be credited (recorded for reference). */
  nonDeductibleInputVat: number;
  /** Net VAT = output − creditable input. */
  netVat: number;
  position: VatPosition;
  ruleset: {
    id: string;
    taxYear: string;
    jurisdiction: Jurisdiction;
    source: TaxRuleSource;
    verified: boolean;
    label: string;
  };
  audit: AuditStep[];
}

/** Taxpayer turnover/status inputs used for registration assessment. */
export interface VatRegistrationContext {
  /** Quarterly turnover on ordinary taxable supplies. */
  standardQuarterTurnover?: number;
  /** Twelve-month turnover on ordinary taxable supplies. */
  standardAnnualTurnover?: number;
  /** Quarterly turnover on financial services. */
  financialQuarterTurnover?: number;
  /** Annum turnover on financial services. */
  financialAnnualTurnover?: number;
  /** True for persons importing/exporting goods for commercial purposes. */
  importsOrExportsForCommercialPurpose?: boolean;
  /** True for a non-resident person supplying through an electronic platform to Sri Lanka. */
  isNonResidentElectronicPlatformSupplier?: boolean;
  /** Platform turnover within the last three months. */
  platformTurnoverLast3Months?: number;
  /** Platform turnover within the last twelve months. */
  platformTurnoverLast12Months?: number;
  /** True when the person carries out taxable supplies at all (voluntary path). */
  carriesOutTaxableSupplies?: boolean;
}

/** A single threshold comparison in the registration assessment. */
export interface VatThresholdResult {
  label: string;
  /** The exclusive "more than" bound, or null when not applicable. */
  threshold: number | null;
  /** The turnover compared against the bound. */
  turnover: number | null;
  /** True when turnover exceeds the bound. */
  meets: boolean;
  note?: string;
}

/** Result of a VAT registration-threshold assessment. */
export interface VatRegistrationAssessment {
  status: VatRegistrationStatus;
  /** Short explanation of why the status was assigned. */
  reason: string;
  /** The category that drove the (mandatory/voluntary) determination, if any. */
  category: VatRegistrationCategory | "IMPORT_EXPORT" | null;
  /** Reference date the assessment was checked against (ISO). */
  atDate: string;
  details: VatThresholdResult[];
  ruleset: {
    id: string;
    taxYear: string;
    jurisdiction: Jurisdiction;
    source: TaxRuleSource;
    verified: boolean;
    label: string;
  };
  audit: AuditStep[];
}

// --- Withholding tax (WHT/AIT) inputs & results ----------------------------

/**
 * Inputs to the WHT calculator, in whole LKR, for a single payment.
 * `monthlyAggregate` is the total paid to the recipient/category in the
 * calendar month — required when the selected category has a monthly threshold
 * (to determine whether WHT applies), unused otherwise.
 */
export interface WithholdingInput {
  category: WhtPaymentCategory;
  /** The payment amount on which withholding is assessed. */
  gross: number;
  /** Aggregate payments to this recipient/category in the calendar month. */
  monthlyAggregate?: number;
}

/** Full result of a Withholding Tax calculation. */
export interface WithholdingResult {
  input: WithholdingInput;
  currency: Currency;
  category: WhtPaymentCategory;
  categoryLabel: string;
  /** Rate applied, as a decimal fraction. */
  rate: number;
  /** The exclusive monthly "exceeds" bound, or null when no threshold applies. */
  monthlyThreshold: number | null;
  /** The aggregate used for the threshold comparison (null when no threshold). */
  monthlyAggregate: number | null;
  /** True when the threshold (if any) is exceeded — i.e. WHT is withheld. */
  thresholdMet: boolean;
  /** True when WHT is withheld (always true when there is no threshold). */
  applies: boolean;
  /** Payment amount on which withholding is assessed. */
  gross: number;
  /** Withholding amount (whole LKR). */
  withholding: number;
  /** Gross minus withholding. */
  net: number;
  /** Reference date the calculation was assessed at (ISO). */
  atDate: string;
  ruleset: {
    id: string;
    taxYear: string;
    jurisdiction: Jurisdiction;
    source: TaxRuleSource;
    verified: boolean;
    label: string;
  };
  audit: AuditStep[];
}

// --- Business (company) tax inputs & results -------------------------------

/**
 * Inputs to the business tax calculator, in whole LKR. Income is split into the
 * categories the verified Sri Lankan company rates apply to. Because each
 * differently-taxed activity/source is treated as a separate business (Inland
 * Revenue Act s60(2)), expenses are attributed **per category**: an expense
 * reduces only the income source it directly relates to. Expenses that cannot
 * be attributed to a single source go in `sharedExpenses` and are never deducted
 * (the engine invents no allocation formula) — the computation is held at
 * NEEDS_ALLOCATION until they are specifically attributed. Investment-asset
 * gains are computed on gross with no expense deduction. Amounts are declared
 * inputs: the engine applies no invented eligibility rule.
 */
export interface BusinessTaxInput {
  /** Ordinary (standard) business income, before attributable expenses. */
  standardIncome: number;
  /** Qualifying foreign-currency service income remitted through a bank. */
  foreignCcyServiceIncome: number;
  /** Qualifying foreign-source income in foreign currency remitted through a bank. */
  foreignCcyForeignSourceIncome: number;
  /** Betting and gaming income. */
  bettingGamingIncome: number;
  /** Income from the manufacture/import and sale of liquor or tobacco. */
  liquorTobaccoIncome: number;
  /** Gains from the realisation of investment assets (separate 30% rate, gross — no deduction). */
  investmentAssetGains: number;
  /** Expenses directly attributable to ordinary (standard) business income. */
  ordinaryExpenses: number;
  /** Expenses directly attributable to qualifying foreign-currency service income. */
  foreignCcyServiceExpenses: number;
  /** Expenses directly attributable to qualifying foreign-source income (foreign currency). */
  foreignCcyForeignSourceExpenses: number;
  /** Expenses directly attributable to betting and gaming income. */
  bettingGamingExpenses: number;
  /** Expenses directly attributable to the manufacture/import and sale of liquor or tobacco. */
  liquorTobaccoExpenses: number;
  /**
   * Expenses that cannot be attributed to a single income source. Never deducted;
   * the computation reports NEEDS_ALLOCATION until the user attributes these to a
   * specific category. The engine applies no allocation formula.
   */
  sharedExpenses: number;
}

/**
 * Whether the tax step was computed, withheld pending verification, or held
 * because shared expenses still need to be attributed to a specific source.
 * Only COMPUTED carries a liability; NEEDS_ALLOCATION and NOT_IMPLEMENTED do not
 * (the engine never invents a figure).
 */
export type BusinessTaxComputationStatus =
  | "COMPUTED"
  | "NEEDS_ALLOCATION"
  | "NOT_IMPLEMENTED";

/**
 * One income category's computed tax in the breakdown. Every taxable category
 * (except investment gains) is reduced only by the expenses attributed to it
 * (`expenses`), so `taxable = max(0, gross − expenses)`. `netted` is true for
 * categories that carry an attributable-expense field; investment-asset gains
 * are always gross (`netted` false, `expenses` 0).
 */
export interface BusinessTaxComponentResult {
  category: BusinessIncomeCategory;
  /** Human-readable label for the category. */
  label: string;
  /** Gross income for the category. */
  gross: number;
  /** Expenses attributed to this category (0 for investment-asset gains). */
  expenses: number;
  /** True when this category is reduced by its attributable expenses. */
  netted: boolean;
  /** Taxable income = max(0, gross − expenses) when netted, else gross. */
  taxable: number;
  /** Verified rate applied (decimal fraction), or null when not computed. */
  rate: number | null;
  /** Tax for this category, or null when not computed. */
  tax: number | null;
  /** Optional explanation (e.g. gross treatment / no cross-category allocation). */
  note?: string;
}

/** Full result of a Business Tax calculation. */
export interface BusinessTaxResult {
  input: BusinessTaxInput;
  currency: Currency;
  /** Sum of all gross income across every category. */
  totalGrossIncome: number;
  /** Sum of the attributable (per-category) deductible expenses actually applied. */
  allowableExpenses: number;
  /** Sum of shared expenses that could not be attributed (never deducted). */
  unallocatedExpenses: number;
  /** max(0, standardIncome − ordinaryExpenses). Ordinary income after its own expenses. */
  standardTaxableIncome: number;
  /** One entry per income category that has gross > 0 or attributable expenses > 0. */
  components: BusinessTaxComponentResult[];
  /** Sum of per-category taxable income. */
  totalTaxableIncome: number;
  /** COMPUTED (rates in force, no unallocated expenses); NEEDS_ALLOCATION (shared expenses present); NOT_IMPLEMENTED (no trustworthy rate). */
  taxStatus: BusinessTaxComputationStatus;
  /** Total tax across all categories, or null when not COMPUTED. */
  totalTax: number | null;
  /** Total estimated liability (= total tax; no verified reliefs/credits yet), or null. */
  estimatedLiability: number | null;
  /** Reference date the calculation was assessed at (ISO). */
  atDate: string;
  ruleset: {
    id: string;
    taxYear: string;
    jurisdiction: Jurisdiction;
    source: TaxRuleSource;
    verified: boolean;
    label: string;
  };
  audit: AuditStep[];
}
