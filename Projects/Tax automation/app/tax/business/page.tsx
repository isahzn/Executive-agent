import type { Metadata } from "next";
import { PageHeader, RulesetBadge } from "@/components/page-header";
import { BusinessCalculator } from "@/components/tax/business/business-calculator";
import { getRuleSet } from "@/lib/tax";

export const metadata: Metadata = {
  title: "Business Tax",
};

const RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "BUSINESS" as const,
  taxYear: "2025/2026",
};

export default function BusinessTaxPage() {
  const ruleset = getRuleSet(RULESET_SELECTOR);
  const taxYear = ruleset?.taxYear ?? "—";
  const verified = ruleset?.verified ?? false;

  return (
    <div>
      <PageHeader
        title="Business Tax"
        subtitle={`Sri Lanka · Year of Assessment ${taxYear}. Taxable profit is computed deterministically; tax payable derives from the versioned rules engine — AI never computes tax.`}
        action={<RulesetBadge verified={verified} taxYear={taxYear} />}
      />
      <BusinessCalculator
        taxYear={taxYear}
        currency={ruleset?.currency ?? "LKR"}
        label={ruleset?.label}
        verified={verified}
      />
    </div>
  );
}
