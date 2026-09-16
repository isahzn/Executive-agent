import type { Metadata } from "next";
import { PageHeader, RulesetBadge } from "@/components/page-header";
import { VatCalculator } from "@/components/tax/vat/vat-calculator";
import { getRuleSet } from "@/lib/tax";

export const metadata: Metadata = {
  title: "VAT",
};

const RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "VAT" as const,
  taxYear: "2025/2026",
};

export default function VatPage() {
  const ruleset = getRuleSet(RULESET_SELECTOR);
  const taxYear = ruleset?.taxYear ?? "—";
  const verified = ruleset?.verified ?? false;

  return (
    <div>
      <PageHeader
        title="Value Added Tax"
        subtitle={`Sri Lanka, year of assessment ${taxYear}. Output VAT, deductible input VAT and registration status all derive from the versioned rules engine — AI never computes tax.`}
        action={<RulesetBadge verified={verified} taxYear={taxYear} />}
      />
      <VatCalculator
        taxYear={taxYear}
        currency={ruleset?.currency ?? "LKR"}
        label={ruleset?.label}
        verified={verified}
      />
    </div>
  );
}
