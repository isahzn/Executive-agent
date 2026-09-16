import type { Metadata } from "next";
import { PageHeader, RulesetBadge } from "@/components/page-header";
import { IndividualTaxCalculator } from "@/components/tax/individual/individual-tax-calculator";
import { UploadData } from "@/components/tax/individual/upload-data";
import { getRuleSet } from "@/lib/tax";

export const metadata: Metadata = {
  title: "Individual Income Tax",
};

const RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "INDIVIDUAL_INCOME" as const,
  taxYear: "2025/2026",
};

export default function IndividualTaxPage() {
  const ruleset = getRuleSet(RULESET_SELECTOR);
  const taxYear = ruleset?.taxYear ?? "—";
  const verified = ruleset?.verified ?? false;

  return (
    <div>
      <PageHeader
        title="Individual Income Tax"
        subtitle={`Sri Lanka, year of assessment ${taxYear}. Calculations run through the deterministic rule engine — AI never computes tax.`}
        action={<RulesetBadge verified={verified} taxYear={taxYear} />}
      />
      <IndividualTaxCalculator
        taxYear={taxYear}
        currency={ruleset?.currency ?? "LKR"}
        label={ruleset?.label}
        verified={verified}
      />
      <UploadData />
    </div>
  );
}
