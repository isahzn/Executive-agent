import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { getActiveRuleSet } from "@/lib/tax";
import { formatMoney, formatRate } from "@/lib/tax/money";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const ruleset = getActiveRuleSet(
    { jurisdiction: "LK", taxType: "INDIVIDUAL_INCOME" },
    "2025-07-01"
  );

  const relief = ruleset?.rules.find((r) => r.category === "PERSONAL_RELIEF");
  const topRate = ruleset?.rules
    .filter((r) => r.category === "PROGRESSIVE_BAND")
    .sort((a, b) => (b as { rate: number }).rate - (a as { rate: number }).rate)[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your tax position at a glance. All figures derive from the deterministic rule engine — no AI computes tax."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Estimated tax payable"
          value={formatMoney(0)}
          tone="neutral"
          sub="Run a calculation to populate"
        />
        <Stat
          label="Taxable income"
          value={formatMoney(0)}
          tone="neutral"
          sub="Run a calculation to populate"
        />
        <Stat
          label="VAT position"
          value="—"
          sub="Use the VAT calculator"
        />
        <Stat
          label="Compliance status"
          value="Not started"
          tone="neutral"
          sub="No filings tracked yet"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Quick actions"
            subtitle="Start with a calculation or bring your own data."
          />
          <CardBody className="flex flex-col gap-3">
            <QuickAction
              href="/tax/individual"
              title="Calculate individual income tax"
              description="Enter income and deductions to get an audited 2025/2026 result."
            />
            <QuickAction
              href="/tax/individual#import"
              title="Import financial data"
              description="Upload a CSV or Excel file and map columns into a calculation."
            />
            <QuickAction
              href="/history"
              title="Browse calculation history"
              description="Reopen a saved calculation and see exactly how it was derived."
            />
            <QuickAction
              href="/tax/vat"
              title="Assess VAT"
              description="Calculate output/input VAT or check registration status."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Active ruleset"
            subtitle="Source of truth for calculations"
            action={
              <Badge tone={ruleset?.verified ? "positive" : "warn"}>
                {ruleset?.verified ? "Verified" : "Unverified"}
              </Badge>
            }
          />
          <CardBody className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Jurisdiction · Year</p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                Sri Lanka · {ruleset?.taxYear ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Personal relief</p>
              <p className="mt-0.5 text-sm font-medium text-ink tabular">
                {relief?.category === "PERSONAL_RELIEF"
                  ? formatMoney(relief.amount, ruleset?.currency)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Top marginal rate</p>
              <p className="mt-0.5 text-sm font-medium text-ink tabular">
                {topRate ? formatRate((topRate as { rate: number }).rate) : "—"}
              </p>
            </div>
            <p className="border-t border-line pt-3 text-xs text-ink-faint">
              New tax years and jurisdictions are added as versioned rulesets — the engine logic does not change.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  disabled,
}: {
  href: string;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const inner = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
      </div>
      <span className="text-ink-faint" aria-hidden>
        →
      </span>
    </div>
  );
  return (
    <Link
      href={href}
      className={
        "rounded-md border border-line bg-surface px-4 py-3 transition-colors " +
        (disabled
          ? "pointer-events-none opacity-60"
          : "hover:border-line-strong hover:bg-surface-dim")
      }
      aria-disabled={disabled || undefined}
    >
      {inner}
    </Link>
  );
}
