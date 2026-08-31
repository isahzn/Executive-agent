import type { Metadata } from "next";
import { PageHeader, RulesetBadge } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import {
  WithholdingCalculator,
  type WhtCategoryOption,
} from "@/components/tax/withholding/withholding-calculator";
import { getRuleSet, WHT_CATEGORY_LABEL } from "@/lib/tax";

export const metadata: Metadata = {
  title: "Withholding Tax",
};

const RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "WITHHOLDING" as const,
  taxYear: "2025/2026",
};

export default function WithholdingTaxPage() {
  const ruleset = getRuleSet(RULESET_SELECTOR);
  const taxYear = ruleset?.taxYear ?? "—";
  const verified = ruleset?.verified ?? false;

  const categories: WhtCategoryOption[] = (ruleset?.rules ?? [])
    .filter((r) => r.category === "WITHHOLDING_RATE")
    .map((r) => {
      const rule = r as Extract<typeof r, { category: "WITHHOLDING_RATE" }>;
      return {
        key: rule.appliesTo,
        label: WHT_CATEGORY_LABEL[rule.appliesTo],
        rate: rule.rate,
        monthlyThreshold: rule.monthlyThreshold,
      };
    });

  if (!ruleset || categories.length === 0) {
    return (
      <div>
        <PageHeader
          title="Withholding Tax"
          subtitle="Sri Lanka · Year of Assessment 2025/2026."
        />
        <Card>
          <CardHeader title="No verified rules" />
          <CardBody>
            <p className="text-sm text-ink-soft">
              No verified Withholding Tax ruleset is configured for this tax year,
              so the calculator is unavailable.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Withholding Tax"
        subtitle={`Sri Lanka · Year of Assessment ${taxYear}. Rates and thresholds come from the versioned rules engine — AI never computes tax.`}
        action={<RulesetBadge verified={verified} taxYear={taxYear} />}
      />
      <WithholdingCalculator
        taxYear={taxYear}
        currency={ruleset.currency}
        label={ruleset.label}
        verified={verified}
        categories={categories}
      />
    </div>
  );
}
