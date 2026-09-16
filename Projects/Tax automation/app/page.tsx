import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { getActiveRuleSet } from "@/lib/tax";
import { formatMoney, formatRate } from "@/lib/tax/money";
import { getPersistence } from "@/lib/database";
import type { SavedCalculation, CalculationType } from "@/lib/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

const TYPE_LABEL: Record<CalculationType, string> = {
  INDIVIDUAL_INCOME: "Individual income tax",
  BUSINESS: "Business tax",
  VAT: "VAT",
  WITHHOLDING: "Withholding tax",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("en-US");
}

/** Extract the key figure from a saved calculation for dashboard display. */
function extractKeyFigure(calc: SavedCalculation): {
  label: string;
  value: string;
  type: CalculationType;
} {
  const result = calc.result as Record<string, unknown>;
  switch (calc.type) {
    case "INDIVIDUAL_INCOME": {
      const totalTax = (result.totalTax as number) ?? 0;
      return {
        label: TYPE_LABEL[calc.type],
        value: formatMoney(totalTax, "LKR"),
        type: calc.type,
      };
    }
    case "VAT": {
      const netVat = (result.netVat as number) ?? 0;
      const position = (result.position as string) ?? "NIL";
      return {
        label: TYPE_LABEL[calc.type],
        value:
          position === "PAYABLE"
            ? `Payable ${formatMoney(netVat, "LKR")}`
            : position === "REFUNDABLE"
              ? `Refundable ${formatMoney(Math.abs(netVat), "LKR")}`
              : "Nil",
        type: calc.type,
      };
    }
    case "WITHHOLDING": {
      const withholding = (result.withholding as number) ?? 0;
      return {
        label: TYPE_LABEL[calc.type],
        value: formatMoney(withholding, "LKR"),
        type: calc.type,
      };
    }
    case "BUSINESS": {
      const totalTax = (result.totalTax as number) ?? null;
      const taxStatus = (result.taxStatus as string) ?? "NOT_IMPLEMENTED";
      return {
        label: TYPE_LABEL[calc.type],
        value:
          totalTax != null
            ? formatMoney(totalTax, "LKR")
            : taxStatus === "NEEDS_ALLOCATION"
              ? "Needs allocation"
              : "Awaiting rules",
        type: calc.type,
      };
    }
    default:
      return { label: "Unknown", value: "—", type: calc.type };
  }
}

export default async function DashboardPage() {
  const ruleset = getActiveRuleSet(
    { jurisdiction: "LK", taxType: "INDIVIDUAL_INCOME" },
    "2025-07-01"
  );

  const relief = ruleset?.rules.find((r) => r.category === "PERSONAL_RELIEF");
  const topRate = ruleset?.rules
    .filter((r) => r.category === "PROGRESSIVE_BAND")
    .sort((a, b) => (b as { rate: number }).rate - (a as { rate: number }).rate)[0];

  // Fetch latest calculations from history for live dashboard data
  const calculations = await getPersistence().list();
  const latest = calculations.length > 0 ? calculations[0] : null;
  const latestKeyFigure = latest ? extractKeyFigure(latest) : null;

  // Count by type
  const counts: Record<CalculationType, number> = {
    INDIVIDUAL_INCOME: 0,
    BUSINESS: 0,
    VAT: 0,
    WITHHOLDING: 0,
  };
  for (const c of calculations) {
    counts[c.type]++;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your tax position at a glance. Every figure comes from the deterministic rule engine — no AI computes tax."
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        {latest ? (
          <>
            <Stat
              label="Latest calculation"
              value={latestKeyFigure?.value ?? "—"}
              tone="positive"
              sub={`${TYPE_LABEL[latest.type]}, year ${latest.taxYear}`}
            />
            <Stat
              label="Calculations run"
              value={String(calculations.length)}
              sub={`Last run ${formatDate(latest.createdAt)}`}
            />
          </>
        ) : (
          <>
            <Stat label="Tax payable" value="—" sub="No calculations yet" />
            <Stat
              label="Calculations run"
              value="0"
              sub="Run your first calculation"
            />
          </>
        )}
        <Stat
          label="VAT"
          value={counts.VAT > 0 ? `${counts.VAT} calculated` : "—"}
          tone={counts.VAT > 0 ? "positive" : "neutral"}
          sub={counts.VAT > 0 ? "Open the VAT calculator" : "Use the VAT calculator"}
        />
        <Stat label="Rule sets loaded" value="4" sub="Sri Lanka 2025/2026" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main column — the work */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {calculations.length > 0 ? (
            <Card>
              <CardHeader
                title="Recent calculations"
                subtitle={`${calculations.length} saved, most recent first`}
              />
              <CardBody className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-5 py-2 text-left text-sm font-semibold text-ink-soft">
                        Calculation
                      </th>
                      <th className="px-5 py-2 text-right text-sm font-semibold text-ink-soft">
                        Result
                      </th>
                      <th className="px-5 py-2 text-right text-sm font-semibold text-ink-soft">
                        Run
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.slice(0, 5).map((calc) => {
                      const kf = extractKeyFigure(calc);
                      return (
                        <tr key={calc.id} className="border-b border-line last:border-0">
                          <td className="px-5 py-2.5">
                            <Link
                              href={`/history/${calc.id}`}
                              className="font-medium text-navy hover:underline"
                            >
                              {TYPE_LABEL[calc.type]}, year {calc.taxYear}
                            </Link>
                          </td>
                          <td className="px-5 py-2.5 text-right tabular font-medium text-ink">
                            {kf.value}
                          </td>
                          <td className="px-5 py-2.5 text-right tabular text-ink-faint">
                            {formatDate(calc.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title="Start here"
              subtitle="Run a calculation or bring your own data."
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
                href="/tax/vat"
                title="Calculate VAT"
                description="Calculate output and input VAT or check registration status."
              />
              <QuickAction
                href="/tax/business"
                title="Calculate business tax"
                description="Compute taxable profit across income categories with attributable expenses."
              />
              <QuickAction
                href="/tax/withholding"
                title="Calculate withholding tax"
                description="Check WHT and AIT on payments with verified rates and thresholds."
              />
              <QuickAction
                href="/history"
                title="Browse calculation history"
                description="Reopen a saved calculation and see exactly how it was derived."
              />
            </CardBody>
          </Card>
        </div>

        {/* Right rail — the fine print */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader
              title="Active rule set"
              subtitle="The source of truth for every calculation"
            />
            <CardBody className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-ink-faint">Jurisdiction and year</p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  Sri Lanka, {ruleset?.taxYear ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Personal relief</p>
                <p className="mt-0.5 text-sm font-medium text-ink tabular">
                  {relief?.category === "PERSONAL_RELIEF"
                    ? formatMoney(relief.amount, ruleset?.currency)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Top marginal rate</p>
                <p className="mt-0.5 text-sm font-medium text-ink tabular">
                  {topRate ? formatRate((topRate as { rate: number }).rate) : "—"}
                </p>
              </div>
              <p className="border-t border-line pt-3 text-xs text-ink-faint">
                New tax years and jurisdictions are added as versioned rule sets.
                The engine logic does not change.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Verification status" />
            <CardBody className="flex flex-col gap-2">
              <Badge tone={ruleset?.verified ? "positive" : "warn"} className="w-fit">
                {ruleset?.verified ? "Verified" : "Unverified"}
              </Badge>
              <p className="text-xs text-ink-faint">
                {ruleset?.verified
                  ? "Every rate in this rule set has been checked against the published IRD source."
                  : "This rule set has not completed verification. Treat its results as provisional."}
              </p>
            </CardBody>
          </Card>
        </div>
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
    </div>
  );
  return (
    <Link
      href={href}
      className={
        "cursor-pointer rounded-md border border-line bg-surface px-4 py-3 transition-colors " +
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
