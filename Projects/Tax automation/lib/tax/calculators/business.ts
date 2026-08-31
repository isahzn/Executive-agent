import type {
  BusinessIncomeCategory,
  BusinessTaxComponentResult,
  BusinessTaxInput,
  BusinessTaxResult,
  TaxRuleSet,
  TaxRule,
  AuditStep,
} from "../types";
import { roundToRupee } from "../engine/rounding";

const NON_NEGATIVE_FIELDS: Array<keyof BusinessTaxInput> = [
  "standardIncome",
  "foreignCcyServiceIncome",
  "foreignCcyForeignSourceIncome",
  "bettingGamingIncome",
  "liquorTobaccoIncome",
  "investmentAssetGains",
  "costOfGoodsSold",
  "operatingExpenses",
  "otherAllowableExpenses",
  "capitalAllowances",
  "otherDeductions",
];

/** The declared expense input keys, in display order (used in the audit detail). */
const EXPENSE_KEYS = [
  "costOfGoodsSold",
  "operatingExpenses",
  "otherAllowableExpenses",
  "capitalAllowances",
  "otherDeductions",
] as const satisfies readonly (keyof BusinessTaxInput)[];

/**
 * Ordered metadata for every taxable income category. `netted` indicates whether
 * the declared expense pool reduces that category (only the ordinary/standard
 * pool). `incomeKey` is the corresponding `BusinessTaxInput` field.
 */
const CATEGORY_META: Array<{
  category: BusinessIncomeCategory;
  incomeKey: keyof BusinessTaxInput;
  label: string;
  netted: boolean;
}> = [
  { category: "STANDARD", incomeKey: "standardIncome", label: "Ordinary business income", netted: true },
  { category: "FXCY_SERVICE", incomeKey: "foreignCcyServiceIncome", label: "Foreign-currency service income", netted: false },
  { category: "FXCY_FOREIGN_SOURCE", incomeKey: "foreignCcyForeignSourceIncome", label: "Foreign-source income (foreign currency)", netted: false },
  { category: "BETTING_GAMING", incomeKey: "bettingGamingIncome", label: "Betting & gaming", netted: false },
  { category: "LIQUOR_TOBACCO", incomeKey: "liquorTobaccoIncome", label: "Liquor & tobacco", netted: false },
  { category: "INVESTMENT_ASSET_GAINS", incomeKey: "investmentAssetGains", label: "Investment-asset gains", netted: false },
];

/** Validate raw business input; returns a list of human-readable errors (empty = valid). */
export function validateBusinessTaxInput(
  input: Partial<BusinessTaxInput>
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

type BusinessTaxRule = Extract<TaxRule, { category: "BUSINESS_TAX" }>;

/** Resolve every active BUSINESS_TAX rule in force at `atDate`, keyed by category. */
function businessTaxRulesByCategory(
  set: TaxRuleSet,
  atDate: string
): Map<BusinessIncomeCategory, BusinessTaxRule> {
  const map = new Map<BusinessIncomeCategory, BusinessTaxRule>();
  for (const rule of set.rules) {
    if (rule.category !== "BUSINESS_TAX") continue;
    if (atDate >= rule.effectiveFrom && (rule.effectiveTo === null || atDate <= rule.effectiveTo)) {
      map.set(rule.appliesTo, rule);
    }
  }
  return map;
}

/**
 * Deterministic Business Tax calculation.
 *
 * The income step computes per-category taxable income: the declared allowable
 * expense pool reduces ONLY the ordinary (standard) income (clamped at 0 — loss
 * is not carried forward), while the special-rate categories (15% / 45%) and
 * investment-asset gains are computed on gross with no cross-category
 * allocation. The tax step is computed only when the supplied ruleset is
 * `verified` AND carries an active BUSINESS_TAX rule for every category with
 * income; otherwise it is reported as NOT_IMPLEMENTED and no liability figure is
 * produced (the engine never invents a rate). Pure and framework-agnostic — it
 * never consults an LLM or a hard-coded tax value.
 */
export function calculateBusinessTax(
  input: BusinessTaxInput,
  ruleset: TaxRuleSet,
  atDate: string
): BusinessTaxResult {
  const errors = validateBusinessTaxInput(input);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join("; ")}`);
  }

  const { allowableExpenses, totalGrossIncome } = computeTotals(input);
  const standardTaxableIncome = Math.max(0, input.standardIncome - allowableExpenses);

  const rulesByCategory = businessTaxRulesByCategory(ruleset, atDate);
  const incomeCategories = CATEGORY_META.filter((m) => input[m.incomeKey] > 0);
  const allHaveRules = incomeCategories.every((m) => rulesByCategory.has(m.category));
  const computed = ruleset.verified && allHaveRules;

  const components: BusinessTaxComponentResult[] = incomeCategories.map((m) => {
    const gross = input[m.incomeKey];
    const taxable = m.netted ? standardTaxableIncome : gross;
    const rule = rulesByCategory.get(m.category);
    const rate = computed && rule ? rule.rate : null;
    const tax = computed && rule ? roundToRupee(taxable * rule.rate) : null;
    return {
      category: m.category,
      label: m.label,
      gross,
      netted: m.netted,
      taxable,
      rate,
      tax,
      note: m.netted
        ? "Declared allowable expenses are applied to ordinary business income."
        : m.category === "INVESTMENT_ASSET_GAINS"
          ? "Separately calculated at 30% — gross, no expense deduction."
          : "Computed on gross — declared expenses are not allocated to this category.",
    };
  });

  const totalTaxableIncome = components.reduce((sum, c) => sum + c.taxable, 0);
  const totalTax = computed
    ? components.reduce((sum, c) => sum + (c.tax ?? 0), 0)
    : null;
  const estimatedLiability = totalTax;

  const audit: AuditStep[] = [
    { label: "Total gross income", amount: totalGrossIncome },
    {
      label: "Allowable expenses",
      amount: allowableExpenses,
      detail: formatExpenseDetail(input),
    },
    ...components.map((c) => ({
      label: c.netted ? "Ordinary business income (net of expenses)" : c.label,
      amount: c.taxable,
      detail: c.netted
        ? `${input.standardIncome.toLocaleString("en-US")} − ${allowableExpenses.toLocaleString("en-US")}`
        : "gross — no expense netting",
    })),
  ];

  if (computed) {
    for (const c of components) {
      audit.push({
        label: `${c.label} @ ${(c.rate! * 100).toFixed(c.rate! * 100 % 1 === 0 ? 0 : 1)}%`,
        amount: c.tax!,
        detail: `${c.taxable.toLocaleString("en-US")} × ${(c.rate! * 100).toFixed(c.rate! * 100 % 1 === 0 ? 0 : 1)}%`,
      });
    }
    audit.push({ label: "Total business tax", amount: totalTax! });
    audit.push({ label: "Estimated liability", amount: totalTax! });
  } else {
    audit.push({
      label: "Business tax",
      amount: 0,
      detail:
        "NOT IMPLEMENTED — the ruleset is not verified, or no verified IRD business tax rule is in force for every income category.",
    });
    audit.push({
      label: "Estimated liability",
      amount: 0,
      detail: "NOT IMPLEMENTED — awaiting an authoritative source.",
    });
  }

  return {
    input,
    currency: ruleset.currency,
    totalGrossIncome,
    allowableExpenses,
    standardTaxableIncome,
    components,
    totalTaxableIncome,
    taxStatus: computed ? "COMPUTED" : "NOT_IMPLEMENTED",
    totalTax,
    estimatedLiability,
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

function computeTotals(input: BusinessTaxInput): {
  allowableExpenses: number;
  totalGrossIncome: number;
} {
  const allowableExpenses =
    input.costOfGoodsSold +
    input.operatingExpenses +
    input.otherAllowableExpenses +
    input.capitalAllowances +
    input.otherDeductions;
  const totalGrossIncome = CATEGORY_META.reduce(
    (sum, m) => sum + input[m.incomeKey],
    0
  );
  return { allowableExpenses, totalGrossIncome };
}

function formatExpenseDetail(input: BusinessTaxInput): string {
  const parts: string[] = [];
  for (const key of EXPENSE_KEYS) {
    const value = input[key];
    if (value > 0) parts.push(value.toLocaleString("en-US"));
  }
  return parts.join(" + ") || "0";
}
