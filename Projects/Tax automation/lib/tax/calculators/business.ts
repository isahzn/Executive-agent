import type {
  BusinessIncomeCategory,
  BusinessTaxComponentResult,
  BusinessTaxComputationStatus,
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
  "ordinaryExpenses",
  "foreignCcyServiceExpenses",
  "foreignCcyForeignSourceExpenses",
  "bettingGamingExpenses",
  "liquorTobaccoExpenses",
  "sharedExpenses",
];

const FIELD_LABELS: Record<keyof BusinessTaxInput, string> = {
  standardIncome: "Ordinary business income",
  foreignCcyServiceIncome: "Foreign-currency service income",
  foreignCcyForeignSourceIncome: "Foreign-source income (FC)",
  bettingGamingIncome: "Betting & gaming",
  liquorTobaccoIncome: "Liquor & tobacco",
  investmentAssetGains: "Investment-asset gains",
  ordinaryExpenses: "Ordinary business income expenses",
  foreignCcyServiceExpenses: "Foreign-currency service expenses",
  foreignCcyForeignSourceExpenses: "Foreign-source income expenses",
  bettingGamingExpenses: "Betting & gaming expenses",
  liquorTobaccoExpenses: "Liquor & tobacco expenses",
  sharedExpenses: "Shared / unallocated expenses",
};

/**
 * Ordered metadata for every income category. Each taxable category (except
 * investment gains) carries its own `expenseKey` — the field holding expenses
 * attributable to that source. The engine never moves expenses across
 * categories: each category is reduced only by the expenses attributed to it.
 */
const CATEGORY_META: Array<{
  category: BusinessIncomeCategory;
  incomeKey: keyof BusinessTaxInput;
  expenseKey: keyof BusinessTaxInput | null;
  label: string;
}> = [
  { category: "STANDARD", incomeKey: "standardIncome", expenseKey: "ordinaryExpenses", label: "Ordinary business income" },
  { category: "FXCY_SERVICE", incomeKey: "foreignCcyServiceIncome", expenseKey: "foreignCcyServiceExpenses", label: "Foreign-currency service income" },
  { category: "FXCY_FOREIGN_SOURCE", incomeKey: "foreignCcyForeignSourceIncome", expenseKey: "foreignCcyForeignSourceExpenses", label: "Foreign-source income (foreign currency)" },
  { category: "BETTING_GAMING", incomeKey: "bettingGamingIncome", expenseKey: "bettingGamingExpenses", label: "Betting & gaming" },
  { category: "LIQUOR_TOBACCO", incomeKey: "liquorTobaccoIncome", expenseKey: "liquorTobaccoExpenses", label: "Liquor & tobacco" },
  { category: "INVESTMENT_ASSET_GAINS", incomeKey: "investmentAssetGains", expenseKey: null, label: "Investment-asset gains" },
];

/** Validate raw business input; returns a list of human-readable errors (empty = valid). */
export function validateBusinessTaxInput(
  input: Partial<BusinessTaxInput>
): string[] {
  const errors: string[] = [];
  for (const field of NON_NEGATIVE_FIELDS) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${FIELD_LABELS[field]} must be a number.`);
    } else if (value < 0) {
      errors.push(`${FIELD_LABELS[field]} cannot be negative.`);
    } else if (!Number.isInteger(value)) {
      errors.push(`${FIELD_LABELS[field]} must be a whole number of rupees.`);
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
 * Income is taxed per category. Because each differently-taxed activity/source
 * is a distinct business (Inland Revenue Act s60(2)), expenses are attributed
 * per category: an expense reduces only the income source it directly relates
 * to. Each category's taxable income is `max(0, gross − attributedExpenses)`
 * (loss is not carried forward). Investment-asset gains are computed on gross
 * and never reduced by business expenses.
 *
 * Expenses the user cannot attribute to a single source go in `sharedExpenses`;
 * the engine applies no allocation formula, so they are never deducted and the
 * result is reported as NEEDS_ALLOCATION with no liability figure, rather than
 * silently assigning them to ordinary income. The tax step is otherwise computed
 * only when the supplied ruleset is `verified` AND carries an active BUSINESS_TAX
 * rule for every category with income; otherwise NOT_IMPLEMENTED (no invented
 * rate). Pure and framework-agnostic — it never consults an LLM or a hard-coded
 * tax value.
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

  const attributedExpenses = CATEGORY_META.reduce(
    (sum, m) => sum + (m.expenseKey ? input[m.expenseKey] : 0),
    0
  );
  const unallocatedExpenses = input.sharedExpenses;
  const totalGrossIncome = CATEGORY_META.reduce(
    (sum, m) => sum + input[m.incomeKey],
    0
  );
  const standardTaxableIncome = Math.max(0, input.standardIncome - input.ordinaryExpenses);

  const rulesByCategory = businessTaxRulesByCategory(ruleset, atDate);
  const included = CATEGORY_META.filter(
    (m) => input[m.incomeKey] > 0 || (m.expenseKey && input[m.expenseKey] > 0)
  );
  // Only categories with positive income need a rate to compute a liability.
  const needRule = included.filter((m) => input[m.incomeKey] > 0);
  const allHaveRules = needRule.every((m) => rulesByCategory.has(m.category));
  const allocationBlocked = unallocatedExpenses > 0;

  let taxStatus: BusinessTaxComputationStatus;
  if (allocationBlocked) taxStatus = "NEEDS_ALLOCATION";
  else if (!ruleset.verified || !allHaveRules) taxStatus = "NOT_IMPLEMENTED";
  else taxStatus = "COMPUTED";
  const computed = taxStatus === "COMPUTED";

  const components: BusinessTaxComponentResult[] = included.map((m) => {
    const gross = input[m.incomeKey];
    const expenses = m.expenseKey ? input[m.expenseKey] : 0;
    const netted = m.expenseKey != null;
    const taxable = netted ? Math.max(0, gross - expenses) : gross;
    const rule = rulesByCategory.get(m.category);
    const rate = computed && rule ? rule.rate : null;
    const tax = computed ? (rule ? roundToRupee(taxable * rule.rate) : 0) : null;
    return {
      category: m.category,
      label: m.label,
      gross,
      expenses,
      netted,
      taxable,
      rate,
      tax,
      note: componentNote(m.category, netted, expenses),
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
      label: "Attributable expenses",
      amount: attributedExpenses,
      detail: formatExpenseDetail(input),
    },
    ...components.map((c) => ({
      label: c.netted ? `${c.label} (net of expenses)` : c.label,
      amount: c.taxable,
      detail: c.netted
        ? `${c.gross.toLocaleString("en-US")} − ${c.expenses.toLocaleString("en-US")}`
        : "gross — no expense deduction",
    })),
  ];

  if (unallocatedExpenses > 0) {
    audit.push({
      label: "Shared / unallocated expenses",
      amount: unallocatedExpenses,
      detail: "NOT deducted — attribute to a specific income source to include them.",
    });
  }

  if (computed) {
    for (const c of components) {
      const rate = rateLabel(c.rate!);
      audit.push({
        label: `${c.label} @ ${rate}`,
        amount: c.tax!,
        detail: `${c.taxable.toLocaleString("en-US")} × ${rate}`,
      });
    }
    audit.push({ label: "Total business tax", amount: totalTax! });
    audit.push({ label: "Estimated liability", amount: totalTax! });
  } else if (taxStatus === "NEEDS_ALLOCATION") {
    audit.push({
      label: "Business tax",
      amount: 0,
      detail:
        "NEEDS ALLOCATION — shared expenses cannot be attributed to a single source. Attribute them to a specific income source, or remove them, to compute a liability.",
    });
    audit.push({
      label: "Estimated liability",
      amount: 0,
      detail: "NEEDS ALLOCATION — awaiting explicit expense attribution.",
    });
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
    allowableExpenses: attributedExpenses,
    unallocatedExpenses,
    standardTaxableIncome,
    components,
    totalTaxableIncome,
    taxStatus,
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

function componentNote(
  category: BusinessIncomeCategory,
  netted: boolean,
  expenses: number
): string {
  if (category === "INVESTMENT_ASSET_GAINS") {
    return "Separately calculated at 30% — gross, no expense deduction.";
  }
  if (!netted) return "Computed on gross.";
  return expenses > 0
    ? "Reduced only by expenses attributed to this income source."
    : "Gross — no expenses attributed to this income source.";
}

/** Format the per-category attributed expenses for the audit trail. */
function formatExpenseDetail(input: BusinessTaxInput): string {
  const parts = CATEGORY_META.filter(
    (m) => m.expenseKey && input[m.expenseKey] > 0
  ).map((m) => `${m.label}: ${input[m.expenseKey!].toLocaleString("en-US")}`);
  return parts.length ? parts.join("; ") : "0";
}

function rateLabel(rate: number): string {
  const pct = rate * 100;
  return `${pct.toFixed(pct % 1 === 0 ? 0 : 1)}%`;
}
