import type {
  VatInput,
  VatCalculationResult,
  VatCategoryResult,
  VatRegistrationContext,
  VatRegistrationAssessment,
  VatThresholdResult,
  VatSupplyCategory,
  VatRegistrationCategory,
  VatPosition,
  TaxRuleSet,
  TaxRule,
} from "../types";
import { roundToRupee } from "../engine/rounding";

const VAT_AMOUNT_FIELDS: Array<keyof VatInput> = [
  "standardRatedSales",
  "zeroRatedSales",
  "financialServicesSales",
  "deductibleInputVat",
  "nonDeductibleInputVat",
];

const REG_AMOUNT_FIELDS: Array<keyof VatRegistrationContext> = [
  "standardQuarterTurnover",
  "standardAnnualTurnover",
  "financialQuarterTurnover",
  "financialAnnualTurnover",
  "platformTurnoverLast3Months",
  "platformTurnoverLast12Months",
];

const CATEGORY_LABEL: Record<VatSupplyCategory, string> = {
  STANDARD: "Standard-rated supplies",
  ZERO_RATED: "Zero-rated supplies (exports)",
  FINANCIAL_SERVICES: "Financial services",
};

const POSITION_LABEL: Record<VatPosition, string> = {
  PAYABLE: "Payable to the IRD",
  REFUNDABLE: "Refundable / carry-forward",
  NIL: "Nil",
};

/** Validate VAT calculation amounts; returns human-readable errors (empty = valid). */
export function validateVatInput(input: Partial<VatInput>): string[] {
  const errors: string[] = [];
  for (const field of VAT_AMOUNT_FIELDS) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a number.`);
    } else if (value < 0) {
      errors.push(`${field} cannot be negative.`);
    } else if (!Number.isInteger(value)) {
      errors.push(`${field} must be a whole number of rupees.`);
    }
  }
  return errors;
}

/** Validate optional registration-turnover figures; returns errors (empty = valid). */
export function validateVatRegistrationContext(
  ctx: Partial<VatRegistrationContext>
): string[] {
  const errors: string[] = [];
  for (const field of REG_AMOUNT_FIELDS) {
    const value = ctx[field];
    if (value == null) continue;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} must be a number.`);
    } else if (value < 0) {
      errors.push(`${field} cannot be negative.`);
    } else if (!Number.isInteger(value)) {
      errors.push(`${field} must be a whole number of rupees.`);
    }
  }
  return errors;
}

type VatRateRule = Extract<TaxRule, { category: "VAT_RATE" }>;
type ThresholdRule = Extract<TaxRule, { category: "VAT_REGISTRATION_THRESHOLD" }>;
type SpecialRule = Extract<TaxRule, { category: "VAT_SPECIAL_REGISTRATION" }>;

/** Resolve the VAT rate rule for a supply category that is in force at `atDate`. */
function rateFor(
  set: TaxRuleSet,
  category: VatSupplyCategory,
  atDate: string
): number {
  const rules = set.rules.filter(
    (r): r is VatRateRule =>
      r.category === "VAT_RATE" && r.appliesTo === category
  );
  if (rules.length === 0) {
    throw new Error(`Ruleset ${set.id} has no VAT_RATE rule for ${category}.`);
  }
  const active = rules.find(
    (r) =>
      atDate >= r.effectiveFrom &&
      (r.effectiveTo === null || atDate <= r.effectiveTo)
  );
  return (active ?? rules[0]).rate;
}

/** Resolve the registration-threshold rule in force at `atDate`, or null when n/a. */
function thresholdRuleFor(
  set: TaxRuleSet,
  category: VatRegistrationCategory,
  atDate: string
): ThresholdRule | null {
  const rules = set.rules.filter(
    (r): r is ThresholdRule =>
      r.category === "VAT_REGISTRATION_THRESHOLD" && r.appliesTo === category
  );
  if (rules.length === 0) return null;
  const active = rules.find(
    (r) =>
      atDate >= r.effectiveFrom &&
      (r.effectiveTo === null || atDate <= r.effectiveTo)
  );
  return active ?? null;
}

/** True when a special registration rule of `kind` is in force at `atDate`. */
function hasSpecial(
  set: TaxRuleSet,
  kind: SpecialRule["kind"],
  atDate: string
): boolean {
  return set.rules.some(
    (r): r is SpecialRule =>
      r.category === "VAT_SPECIAL_REGISTRATION" &&
      r.kind === kind &&
      atDate >= r.effectiveFrom &&
      (r.effectiveTo === null || atDate <= r.effectiveTo)
  );
}

/**
 * Deterministic VAT calculation. Output VAT is derived from verified VAT_RATE
 * rules; input VAT is credited only from the amount the taxpayer declares as
 * deductible. No eligibility rule is invented — deductibility is an explicit
 * input. This function is pure and framework-agnostic.
 */
export function calculateVat(
  input: VatInput,
  ruleset: TaxRuleSet
): VatCalculationResult {
  const errors = validateVatInput(input);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join("; ")}`);
  }

  const atDate = ruleset.effectiveFrom;
  const standardRate = rateFor(ruleset, "STANDARD", atDate);
  const zeroRate = rateFor(ruleset, "ZERO_RATED", atDate);
  const fsRate = rateFor(ruleset, "FINANCIAL_SERVICES", atDate);

  const categories: VatCategoryResult[] = [
    {
      category: "STANDARD",
      rate: standardRate,
      amount: input.standardRatedSales,
      outputVat: roundToRupee(input.standardRatedSales * standardRate),
    },
    {
      category: "ZERO_RATED",
      rate: zeroRate,
      amount: input.zeroRatedSales,
      outputVat: roundToRupee(input.zeroRatedSales * zeroRate),
    },
    {
      category: "FINANCIAL_SERVICES",
      rate: fsRate,
      amount: input.financialServicesSales,
      outputVat: roundToRupee(input.financialServicesSales * fsRate),
    },
  ];

  const outputVat = categories.reduce((sum, c) => sum + c.outputVat, 0);
  const creditableInputVat = roundToRupee(input.deductibleInputVat);
  const nonDeductibleInputVat = roundToRupee(input.nonDeductibleInputVat);
  const netVat = outputVat - creditableInputVat;
  const position: VatPosition =
    netVat > 0 ? "PAYABLE" : netVat < 0 ? "REFUNDABLE" : "NIL";

  const audit = [
    ...categories
      .filter((c) => c.amount > 0)
      .map((c) => ({
        label: `${CATEGORY_LABEL[c.category]} @ ${(c.rate * 100).toFixed(0)}%`,
        amount: c.outputVat,
        detail: `${c.amount.toLocaleString("en-US")} × ${(c.rate * 100).toFixed(0)}%`,
      })),
    {
      label: "Creditable input VAT",
      amount: creditableInputVat,
      detail: "Deductible input VAT credited against output VAT",
    },
    {
      label: "Non-deductible input VAT",
      amount: nonDeductibleInputVat,
      detail: "Not credited — shown for reference",
    },
    {
      label: "Net VAT",
      amount: netVat,
      detail: POSITION_LABEL[position],
    },
  ];

  return {
    input,
    currency: ruleset.currency,
    categories,
    outputVat,
    creditableInputVat,
    nonDeductibleInputVat,
    netVat,
    position,
    ruleset: {
      id: ruleset.id,
      taxYear: ruleset.taxYear,
      jurisdiction: ruleset.jurisdiction,
      source: ruleset.source,
      verified: ruleset.verified,
      label: ruleset.label,
    },
    audit,
  };
}

/**
 * Whether the person records taxable (non-exempt) supply turnover. Standard and
 * financial-services supplies are always taxable; non-resident e-platform
 * supply only becomes taxable once its rule is in force at `atDate`.
 */
function hasTaxableTurnover(
  ctx: VatRegistrationContext,
  set: TaxRuleSet,
  atDate: string
): boolean {
  const ordinary =
    ctx.standardQuarterTurnover != null ||
    ctx.standardAnnualTurnover != null ||
    ctx.financialQuarterTurnover != null ||
    ctx.financialAnnualTurnover != null;
  const platform =
    (ctx.platformTurnoverLast3Months != null ||
      ctx.platformTurnoverLast12Months != null) &&
    thresholdRuleFor(set, "NON_RESIDENT_EPLATFORM", atDate) != null;
  return ordinary || platform;
}

/**
 * Deterministic VAT registration-threshold assessment. This is separate from
 * the VAT calculation: it evaluates turnover against the verified thresholds
 * (exclusive "more than" bounds) and the special registration rules. Honors
 * `atDate` so rules that come into force later (e.g. the 2025-10-01
 * non-resident electronic-platform rule) are only applied when active.
 */
export function assessVatRegistration(
  ctx: VatRegistrationContext,
  ruleset: TaxRuleSet,
  atDate: string
): VatRegistrationAssessment {
  const errors = validateVatRegistrationContext(ctx);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join("; ")}`);
  }

  const details: VatThresholdResult[] = [];
  let status: VatRegistrationAssessment["status"] = "NOT_REQUIRED";
  let category: VatRegistrationAssessment["category"] = null;
  let reason =
    "No taxable supplies were recorded and the person does not carry out taxable supplies — no VAT registration obligation arises.";

  // Commercial import/export overrides everything: mandatory regardless of turnover.
  if (ctx.importsOrExportsForCommercialPurpose) {
    if (hasSpecial(ruleset, "IMPORT_EXPORT_MANDATORY", atDate)) {
      status = "MANDATORY";
      category = "IMPORT_EXPORT";
      reason =
        "Persons importing or exporting goods for commercial purposes must register under the VAT Act regardless of turnover thresholds or exemptions.";
      details.push({
        label: "Commercial import/export",
        threshold: null,
        turnover: null,
        meets: true,
        note: "Mandatory regardless of turnover thresholds or exemptions.",
      });
    }
  } else {
    const voluntaryAvailable =
      ctx.carriesOutTaxableSupplies === true || hasTaxableTurnover(ctx, ruleset, atDate);

    // Ordinary taxable supplies (non-financial-services).
    const stdRule = thresholdRuleFor(ruleset, "STANDARD", atDate);
    if (stdRule) {
      const q = ctx.standardQuarterTurnover ?? null;
      const a = ctx.standardAnnualTurnover ?? null;
      if (q != null || a != null) {
        if (q != null && stdRule.quarterly != null && q > stdRule.quarterly) {
          status = "MANDATORY";
          category = "STANDARD";
          reason =
            "Turnover on ordinary taxable supplies exceeds the quarterly registration threshold.";
          details.push({
            label: "Ordinary taxable supplies — quarter",
            threshold: stdRule.quarterly,
            turnover: q,
            meets: true,
            note: "Exceeds the quarter threshold.",
          });
        } else if (
          a != null &&
          stdRule.annual != null &&
          a > stdRule.annual
        ) {
          status = "MANDATORY";
          category = "STANDARD";
          reason =
            "Turnover on ordinary taxable supplies exceeds the annual registration threshold.";
          details.push({
            label: "Ordinary taxable supplies — 12 months",
            threshold: stdRule.annual,
            turnover: a,
            meets: true,
            note: "Exceeds the annual threshold.",
          });
        } else {
          if (q != null)
            details.push({
              label: "Ordinary taxable supplies — quarter",
              threshold: stdRule.quarterly,
              turnover: q,
              meets: false,
              note: "At or below the quarter threshold.",
            });
          if (a != null)
            details.push({
              label: "Ordinary taxable supplies — 12 months",
              threshold: stdRule.annual,
              turnover: a,
              meets: false,
              note: "At or below the annual threshold.",
            });
        }
      }
    }

    // Financial services.
    const fsRule = thresholdRuleFor(ruleset, "FINANCIAL_SERVICES", atDate);
    if (fsRule) {
      const q = ctx.financialQuarterTurnover ?? null;
      const a = ctx.financialAnnualTurnover ?? null;
      if (q != null || a != null) {
        if (q != null && fsRule.quarterly != null && q > fsRule.quarterly) {
          if (status !== "MANDATORY") {
            status = "MANDATORY";
            category = "FINANCIAL_SERVICES";
            reason =
              "Turnover on financial services exceeds the quarterly registration threshold.";
          }
          details.push({
            label: "Financial services — quarter",
            threshold: fsRule.quarterly,
            turnover: q,
            meets: true,
            note: "Exceeds the quarter threshold.",
          });
        } else if (
          a != null &&
          fsRule.annual != null &&
          a > fsRule.annual
        ) {
          if (status !== "MANDATORY") {
            status = "MANDATORY";
            category = "FINANCIAL_SERVICES";
            reason =
              "Turnover on financial services exceeds the annual registration threshold.";
          }
          details.push({
            label: "Financial services — per annum",
            threshold: fsRule.annual,
            turnover: a,
            meets: true,
            note: "Exceeds the annual threshold.",
          });
        } else {
          if (q != null)
            details.push({
              label: "Financial services — quarter",
              threshold: fsRule.quarterly,
              turnover: q,
              meets: false,
              note: "At or below the quarter threshold.",
            });
          if (a != null)
            details.push({
              label: "Financial services — per annum",
              threshold: fsRule.annual,
              turnover: a,
              meets: false,
              note: "At or below the annual threshold.",
            });
        }
      }
    }

    // Non-resident electronic-platform supplier — only when the rule is in force.
    if (ctx.isNonResidentElectronicPlatformSupplier) {
      const epRule = thresholdRuleFor(ruleset, "NON_RESIDENT_EPLATFORM", atDate);
      if (epRule) {
        const p3 = ctx.platformTurnoverLast3Months ?? null;
        const p12 = ctx.platformTurnoverLast12Months ?? null;
        if (p3 != null || p12 != null) {
          if (p3 != null && epRule.quarterly != null && p3 > epRule.quarterly) {
            if (status !== "MANDATORY") {
              status = "MANDATORY";
              category = "NON_RESIDENT_EPLATFORM";
              reason =
                "Non-resident electronic-platform turnover exceeds the three-month registration threshold.";
            }
            details.push({
              label: "Non-resident e-platform — last 3 months",
              threshold: epRule.quarterly,
              turnover: p3,
              meets: true,
              note: "Exceeds the 3-month threshold.",
            });
          } else if (
            p12 != null &&
            epRule.annual != null &&
            p12 > epRule.annual
          ) {
            if (status !== "MANDATORY") {
              status = "MANDATORY";
              category = "NON_RESIDENT_EPLATFORM";
              reason =
                "Non-resident electronic-platform turnover exceeds the twelve-month registration threshold.";
            }
            details.push({
              label: "Non-resident e-platform — last 12 months",
              threshold: epRule.annual,
              turnover: p12,
              meets: true,
              note: "Exceeds the 12-month threshold.",
            });
          } else {
            if (p3 != null)
              details.push({
                label: "Non-resident e-platform — last 3 months",
                threshold: epRule.quarterly,
                turnover: p3,
                meets: false,
                note: "At or below the 3-month threshold.",
              });
            if (p12 != null)
              details.push({
                label: "Non-resident e-platform — last 12 months",
                threshold: epRule.annual,
                turnover: p12,
                meets: false,
                note: "At or below the 12-month threshold.",
              });
          }
        }
      } else {
        details.push({
          label: "Non-resident e-platform",
          threshold: null,
          turnover: null,
          meets: false,
          note: "Rule effective from 2025-10-01; not applied at this date.",
        });
      }
    }

    // Not mandatory → voluntary when the person carries out taxable supplies.
    if (
      status === "NOT_REQUIRED" &&
      voluntaryAvailable &&
      hasSpecial(ruleset, "VOLUNTARY_AVAILABLE", atDate)
    ) {
      status = "VOLUNTARY";
      category = null;
      reason =
        "Turnover is below the mandatory threshold, but the person carries out taxable supplies and may register voluntarily.";
    }
  }

  const audit = details.map((d) => ({
    label: d.label,
    amount: d.turnover ?? 0,
    detail: d.note,
  }));
  audit.push({
    label: "Assessment",
    amount: 0,
    detail: `${status === "MANDATORY" ? "Mandatory registration" : status === "VOLUNTARY" ? "Voluntary registration available" : "Registration not required"}.`,
  });

  return {
    status,
    reason,
    category,
    atDate,
    details,
    ruleset: {
      id: ruleset.id,
      taxYear: ruleset.taxYear,
      jurisdiction: ruleset.jurisdiction,
      source: ruleset.source,
      verified: ruleset.verified,
      label: ruleset.label,
    },
    audit,
  };
}
