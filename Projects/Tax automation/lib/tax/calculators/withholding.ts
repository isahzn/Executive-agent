import type {
  WithholdingInput,
  WithholdingResult,
  WhtPaymentCategory,
  TaxRuleSet,
  TaxRule,
  AuditStep,
} from "../types";
import { roundToRupee } from "../engine/rounding";

/** Human-readable labels for each verified WHT payment category. */
export const WHT_CATEGORY_LABEL: Record<WhtPaymentCategory, string> = {
  NONRESIDENT_TRANSPORT_TELECOM:
    "Non-resident: transport or telecom services (s85(2))",
  GEM_NGJA_AUCTION: "Gem sale at an NGJA auction",
  RESIDENT_NON_EMPLOYEE_SERVICE_FEE:
    "Service fee to a resident non-employee",
  INTEREST_DISCOUNT: "Interest or discount paid",
  RENT_RESIDENT: "Rent to a resident person",
  LOTTERY_BETTING_WINNINGS: "Lottery, reward, betting or gambling winnings",
  CHARGE_NATURAL_RESOURCE_PREMIUM: "Charge, natural-resource payment or premium",
  ROYALTY: "Royalty",
  RENT_NONRESIDENT: "Rent to a non-resident person",
  SERVICE_FEE_INSURANCE_NONRESIDENT:
    "Service fee or insurance premium to a non-resident",
  DIVIDENDS: "Dividends",
};

const VALID_CATEGORIES = new Set(Object.keys(WHT_CATEGORY_LABEL) as WhtPaymentCategory[]);

type WhtRateRule = Extract<TaxRule, { category: "WITHHOLDING_RATE" }>;

/**
 * Resolve the WITHHOLDING_RATE rule for a payment category that is in force at
 * `atDate`. Throws when the verified set lacks an active rule for the category.
 */
function rateRuleFor(
  set: TaxRuleSet,
  category: WhtPaymentCategory,
  atDate: string
): WhtRateRule {
  const rules = set.rules.filter(
    (r): r is WhtRateRule =>
      r.category === "WITHHOLDING_RATE" && r.appliesTo === category
  );
  if (rules.length === 0) {
    throw new Error(`Ruleset ${set.id} has no WITHHOLDING_RATE rule for ${category}.`);
  }
  const active = rules.find(
    (r) =>
      atDate >= r.effectiveFrom &&
      (r.effectiveTo === null || atDate <= r.effectiveTo)
  );
  if (!active) {
    throw new Error(
      `No WITHHOLDING_RATE rule for ${category} is in force at ${atDate}.`
    );
  }
  return active;
}

/** True when a WHT category carries a monthly threshold. */
export function hasMonthlyThreshold(category: WhtPaymentCategory): boolean {
  // The seed's threshold categories are the only ones with a bound. This is a
  // form/validation aid that decides whether the monthly aggregate input is
  // required — the actual bound value comes from the ruleset at calculate time.
  return category === "RESIDENT_NON_EMPLOYEE_SERVICE_FEE" || category === "RENT_RESIDENT";
}

/** Validate WHT input; returns human-readable errors (empty = valid). */
export function validateWithholdingInput(
  input: Partial<WithholdingInput>
): string[] {
  const errors: string[] = [];
  if (input.category == null || !VALID_CATEGORIES.has(input.category)) {
    errors.push("A valid payment category must be selected.");
  } else if (hasMonthlyThreshold(input.category) &&
    input.monthlyAggregate == null
  ) {
    errors.push(
      "The total paid to this recipient this month is required for this category (to check the monthly threshold)."
    );
  }
  if (typeof input.gross !== "number" || !Number.isFinite(input.gross)) {
    errors.push("Gross payment must be a number.");
  } else if (input.gross < 0) {
    errors.push("Gross payment cannot be negative.");
  } else if (!Number.isInteger(input.gross)) {
    errors.push("Gross payment must be a whole number of rupees.");
  }
  const aggregate = input.monthlyAggregate;
  if (aggregate != null) {
    if (typeof aggregate !== "number" || !Number.isFinite(aggregate)) {
      errors.push("Monthly aggregate must be a number.");
    } else if (aggregate < 0) {
      errors.push("Monthly aggregate cannot be negative.");
    } else if (!Number.isInteger(aggregate)) {
      errors.push("Monthly aggregate must be a whole number of rupees.");
    }
  }
  return errors;
}

/**
 * Deterministic Withholding Tax calculation. The rate and (exclusive) monthly
 * threshold come from the versioned rules repository — never hard-coded. The
 * base for withholding is the full payment; the threshold only governs *whether*
 * WHT applies. This function is pure and framework-agnostic.
 */
export function calculateWithholding(
  input: WithholdingInput,
  ruleset: TaxRuleSet,
  atDate: string
): WithholdingResult {
  const errors = validateWithholdingInput(input);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join("; ")}`);
  }

  const rule = rateRuleFor(ruleset, input.category, atDate);
  const threshold = rule.monthlyThreshold;
  const aggregate = threshold == null ? null : (input.monthlyAggregate ?? input.gross);
  const thresholdMet = threshold == null ? true : aggregate! > threshold;
  const applies = thresholdMet;

  const withholding = applies ? roundToRupee(input.gross * rule.rate) : 0;
  const net = input.gross - withholding;

  const audit: AuditStep[] = [
    {
      label: WHT_CATEGORY_LABEL[input.category],
      amount: input.gross,
      detail: `@ ${(rule.rate * 100).toFixed(rule.rate === 0.025 ? 1 : 0)}%`,
    },
  ];
  if (threshold != null) {
    audit.push({
      label: "Monthly threshold check",
      amount: aggregate!,
      detail: `Aggregate ${aggregate!.toLocaleString("en-US")} vs threshold ${threshold.toLocaleString("en-US")} — ${
        thresholdMet ? "exceeded" : "not exceeded"
      }.`,
    });
  }
  audit.push({ label: "Withholding tax", amount: withholding });
  audit.push({ label: "Net payment", amount: net });

  return {
    input,
    currency: ruleset.currency,
    category: input.category,
    categoryLabel: WHT_CATEGORY_LABEL[input.category],
    rate: rule.rate,
    monthlyThreshold: threshold,
    monthlyAggregate: aggregate,
    thresholdMet,
    applies,
    gross: input.gross,
    withholding,
    net,
    atDate,
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
