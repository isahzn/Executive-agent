import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRate } from "@/lib/tax/money";
import type { BusinessTaxResult } from "@/lib/tax";

const EXPENSE_LABEL: Record<
  "costOfGoodsSold" | "operatingExpenses" | "otherAllowableExpenses" | "capitalAllowances" | "otherDeductions",
  string
> = {
  costOfGoodsSold: "Cost of goods sold",
  operatingExpenses: "Operating expenses",
  otherAllowableExpenses: "Other allowable expenses",
  capitalAllowances: "Capital allowances",
  otherDeductions: "Other deductions",
};

export function BusinessTaxResult({ result }: { result: BusinessTaxResult }) {
  const currency = result.currency;
  const computed = result.taxStatus === "COMPUTED";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total gross income" value={formatMoney(result.totalGrossIncome, currency)} sub="all categories" />
        <Stat
          label="Allowable expenses"
          value={formatMoney(result.allowableExpenses, currency)}
          sub="declared, to ordinary income"
        />
        <Stat
          label="Taxable income"
          value={formatMoney(result.totalTaxableIncome, currency)}
          sub="after expense treatment"
        />
        <Stat
          label="Tax payable"
          value={computed ? formatMoney(result.totalTax ?? 0, currency) : "Not implemented"}
          tone={computed ? "warn" : "neutral"}
          sub={computed ? "sum of category tax" : "no verified rate"}
        />
      </div>

      <Card>
        <CardHeader
          title="Computation"
          subtitle={`${result.ruleset.label} · assessed at ${result.atDate}`}
          action={
            <Badge tone={computed ? "warn" : "neutral"}>
              {computed ? "Tax computed" : "Tax NOT_IMPLEMENTED"}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid grid-cols-1 gap-1.5 text-sm">
            {(
              [
                "standardIncome",
                "foreignCcyServiceIncome",
                "foreignCcyForeignSourceIncome",
                "bettingGamingIncome",
                "liquorTobaccoIncome",
                "investmentAssetGains",
              ] as const
            ).map((key) => (
              <div key={key} className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-soft">{INCOME_LABEL[key]}</dt>
                <dd className="tabular text-ink">{formatMoney(result.input[key], currency)}</dd>
              </div>
            ))}
            {(
              [
                "costOfGoodsSold",
                "operatingExpenses",
                "otherAllowableExpenses",
                "capitalAllowances",
                "otherDeductions",
              ] as const
            ).map((key) => (
              <div key={key} className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-soft">{EXPENSE_LABEL[key]}</dt>
                <dd className="tabular text-ink">
                  <span className="text-ink-soft">−&nbsp;</span>
                  {formatMoney(result.input[key], currency)}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-1.5">
              <dt className="font-medium text-ink">Ordinary business income (net of expenses)</dt>
              <dd className="font-semibold tabular text-ink">
                {formatMoney(result.standardTaxableIncome, currency)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Applicable business tax"
          subtitle={
            computed
              ? "Each income category is taxed at its verified rate; declared expenses reduce ordinary income only."
              : "No verified rate for every category — see below."
          }
          action={
            computed ? (
              <Badge tone="warn">{formatMoney(result.totalTax ?? 0, currency)}</Badge>
            ) : (
              <Badge tone="neutral">NOT_IMPLEMENTED</Badge>
            )
          }
        />
        <CardBody>
          {computed ? (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-2.5 font-medium">Category</th>
                    <th className="px-5 py-2.5 text-right font-medium">Taxable</th>
                    <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                    <th className="px-5 py-2.5 text-right font-medium">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {result.components.map((c) => (
                    <tr key={c.category} className="border-t border-line">
                      <td className="px-5 py-2.5 text-ink">
                        {c.label}
                        {c.note ? <span className="ml-1.5 text-xs text-ink-faint">{c.note}</span> : null}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular text-ink">
                        {formatMoney(c.taxable, currency)}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular text-ink">
                        {c.rate != null ? formatRate(c.rate) : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular text-warn">
                        {c.tax != null ? formatMoney(c.tax, currency) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-line-strong bg-surface-dim">
                    <td className="px-5 py-2.5 font-medium text-ink">Total taxable income</td>
                    <td className="px-5 py-2.5 text-right tabular text-ink">
                      {formatMoney(result.totalTaxableIncome, currency)}
                    </td>
                    <td className="px-5 py-2.5" />
                    <td className="px-5 py-2.5 text-right font-semibold tabular text-warn">
                      {formatMoney(result.totalTax ?? 0, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              </div>
              <p className="text-xs text-ink-faint">
                Investment-asset gains are separately calculated at 30% on gross — no expense deduction.
                The 15% and 45% categories are computed on gross; declared expenses are not allocated to
                them and no cross-category offset is applied.
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              The tax step is <span className="font-medium text-ink">NOT_IMPLEMENTED</span> because no
              verified IRD business tax rule is in force for every income category entered. Taxable income
              is computed deterministically here; the liability is withheld rather than estimated from a
              fabricated figure. An authoritative source must be added to the versioned rules before a
              liability is shown.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Audit trail"
          subtitle="How this result was derived — no AI in the calculation."
        />
        <CardBody>
          <ol className="flex flex-col gap-2">
            {result.audit.map((step, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-ink-soft">
                  <span className="mr-2 text-ink-faint">{i + 1}.</span>
                  {step.label}
                  {step.detail ? <span className="ml-2 text-ink-faint">{step.detail}</span> : null}
                </span>
                <span className="font-medium tabular">
                  {step.amount === 0 && step.detail?.includes("NOT IMPLEMENTED")
                    ? "—"
                    : formatMoney(step.amount, currency)}
                </span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

const INCOME_LABEL: Record<
  "standardIncome" | "foreignCcyServiceIncome" | "foreignCcyForeignSourceIncome" | "bettingGamingIncome" | "liquorTobaccoIncome" | "investmentAssetGains",
  string
> = {
  standardIncome: "Ordinary business income",
  foreignCcyServiceIncome: "Foreign-currency service income",
  foreignCcyForeignSourceIncome: "Foreign-source income (foreign currency)",
  bettingGamingIncome: "Betting & gaming",
  liquorTobaccoIncome: "Liquor & tobacco",
  investmentAssetGains: "Investment-asset gains",
};
