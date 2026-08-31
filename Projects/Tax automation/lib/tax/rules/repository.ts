import type { TaxRuleSelector, TaxRuleSet } from "../types";
import { SL_LK_INDIVIDUAL_2025_26 } from "./sl-lk-2025-26";
import { SL_LK_VAT_2025_26 } from "./sl-lk-vat-2025-26";
import { SL_LK_WHT_2025_26 } from "./sl-lk-wht-2025-26";
import { SL_LK_BUSINESS_2025_26 } from "./sl-lk-business-2025-26";

/**
 * Registry of every known ruleset. Historical sets stay here so past
 * calculations remain reproducible. New tax years / jurisdictions are
 * registered here as data — no engine or calculator change required.
 */
const RULE_SETS: TaxRuleSet[] = [
  SL_LK_INDIVIDUAL_2025_26,
  SL_LK_VAT_2025_26,
  SL_LK_WHT_2025_26,
  SL_LK_BUSINESS_2025_26,
];

/** All registered rulesets (read-only). */
export function getAllRuleSets(): TaxRuleSet[] {
  return RULE_SETS;
}

/**
 * Resolve the exact ruleset for a jurisdiction + tax type + tax year.
 * Selector must match on all three keys; returns null when no matching,
 * verified-compatible set exists.
 */
export function getRuleSet(selector: TaxRuleSelector): TaxRuleSet | null {
  return (
    RULE_SETS.find(
      (r) =>
        r.jurisdiction === selector.jurisdiction &&
        r.taxType === selector.taxType &&
        r.taxYear === selector.taxYear
    ) ?? null
  );
}

/**
 * Resolve the ruleset for a jurisdiction + tax type, choosing the set active
 * as of a given ISO date (YYYY-MM-DD). Useful when a calculation is tied to a
 * transaction/period rather than a tax year. Falls back to the one whose
 * effective window contains the date; if none, returns the single registered
 * set for that jurisdiction+type (or null).
 */
export function getActiveRuleSet(
  selector: Omit<TaxRuleSelector, "taxYear">,
  atDate: string
): TaxRuleSet | null {
  const matches = RULE_SETS.filter(
    (r) =>
      r.jurisdiction === selector.jurisdiction && r.taxType === selector.taxType
  );
  const active = matches.find(
    (r) => atDate >= r.effectiveFrom && atDate <= r.effectiveTo
  );
  return active ?? (matches.length === 1 ? matches[0] : null);
}
