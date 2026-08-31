import type {
  IndividualIncomeInput,
  IndividualIncomeResult,
  TaxRuleSet,
  TaxRule,
} from "../types";
import { applyProgressiveBands } from "../engine/progressive";
import { roundToRupee } from "../engine/rounding";

const NON_NEGATIVE_FIELDS: Array<keyof IndividualIncomeInput> = [
  "employmentIncome",
  "businessIncome",
  "investmentIncome",
  "otherIncome",
  "allowableDeductions",
  "investmentAssetGains",
];

/** Validate raw input; returns a list of human-readable errors (empty = valid). */
export function validateIndividualIncomeInput(
  input: Partial<IndividualIncomeInput>
): string[] {
  const errors: string[] = [];
  for (const field of NON_NEGATIVE_FIELDS) {
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

/** Extract the single relief rule, or throw if a verified set lacks one. */
function reliefRule(set: TaxRuleSet): Extract<TaxRule, { category: "PERSONAL_RELIEF" }> {
  const rule = set.rules.find((r) => r.category === "PERSONAL_RELIEF");
  if (!rule) {
    throw new Error(`Ruleset ${set.id} has no personal relief rule.`);
  }
  return rule;
}

/** Extract the balance/flat rate rule for investment-asset gains, if present. */
function investmentGainsRate(set: TaxRuleSet): number {
  const rule = set.rules.find(
    (r): r is Extract<TaxRule, { category: "FLAT_RATE" }> =>
      r.category === "FLAT_RATE" && r.appliesTo === "INVESTMENT_ASSET_GAINS"
  );
  return rule?.rate ?? 0;
}

/**
 * Deterministic Individual Income Tax calculation.
 *
 * Flow: assessable income → personal relief → progressive bands → tax.
 * Gains from realisation of investment assets are taxed separately at their
 * own rate and are NOT reduced by the personal relief.
 *
 * This function is pure and framework-agnostic; it never consults an LLM or
 * a hard-coded tax value — it consumes the supplied `ruleset`.
 */
export function calculateIndividualIncomeTax(
  input: IndividualIncomeInput,
  ruleset: TaxRuleSet
): IndividualIncomeResult {
  const errors = validateIndividualIncomeInput(input);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join("; ")}`);
  }

  const relief = reliefRule(ruleset);
  const gainsRate = investmentGainsRate(ruleset);

  const grossOrdinary =
    input.employmentIncome +
    input.businessIncome +
    input.investmentIncome +
    input.otherIncome;
  const ordinaryAssessableIncome = Math.max(
    0,
    grossOrdinary - input.allowableDeductions
  );

  const personalRelief = relief.amount;
  // Relief is capped at what assessable income can absorb; applied is what's
  // actually deducted, so income below the relief uses only what it has.
  const personalReliefApplied = Math.min(ordinaryAssessableIncome, personalRelief);
  const taxableAfterRelief = Math.max(0, ordinaryAssessableIncome - personalReliefApplied);

  const bands = ruleset.rules.filter(
    (r): r is Extract<TaxRule, { category: "PROGRESSIVE_BAND" }> =>
      r.category === "PROGRESSIVE_BAND"
  );
  const { bands: bandResults, total: bandTax } = applyProgressiveBands(
    taxableAfterRelief,
    bands
  );

  const investmentGainsTax = roundToRupee(input.investmentAssetGains * gainsRate);
  const totalTax = bandTax + investmentGainsTax;

  const denominator = ordinaryAssessableIncome + input.investmentAssetGains;
  const effectiveRate = denominator > 0 ? totalTax / denominator : 0;

  const audit = [
    {
      label: "Ordinary assessable income",
      amount: ordinaryAssessableIncome,
      detail: `${[
        input.employmentIncome,
        input.businessIncome,
        input.investmentIncome,
        input.otherIncome,
      ]
        .filter((n) => n > 0)
        .join(" + ")} − deductions ${input.allowableDeductions}`,
    },
    {
      label: "Personal relief applied",
      amount: personalReliefApplied,
      detail: `Of ${personalRelief.toLocaleString("en-US")} available`,
    },
    {
      label: "Taxable income",
      amount: taxableAfterRelief,
      detail: `${ordinaryAssessableIncome.toLocaleString("en-US")} − relief ${personalReliefApplied.toLocaleString("en-US")}`,
    },
    ...bandResults.map((b) => ({
      label: `Band ${b.lower.toLocaleString("en-US")}–${b.upper === null ? "∞" : b.upper.toLocaleString("en-US")} @ ${(b.rate * 100).toFixed(0)}%`,
      amount: b.tax,
      detail: `${b.amountInBand.toLocaleString("en-US")} × ${(b.rate * 100).toFixed(0)}%`,
    })),
    {
      label: "Investment asset gains",
      amount: investmentGainsTax,
      detail: `${input.investmentAssetGains.toLocaleString("en-US")} × ${(gainsRate * 100).toFixed(0)}%`,
    },
    { label: "Total tax", amount: totalTax },
  ];

  return {
    input,
    currency: ruleset.currency,
    ordinaryAssessableIncome,
    personalRelief,
    personalReliefApplied,
    taxableAfterRelief,
    bands: bandResults,
    bandTax,
    investmentAssetGains: input.investmentAssetGains,
    investmentGainsRate: gainsRate,
    investmentGainsTax,
    totalTax,
    effectiveRate,
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
