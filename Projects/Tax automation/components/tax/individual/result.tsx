import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRate } from "@/lib/tax/money";
import type { IndividualIncomeResult } from "@/lib/tax";

export function TaxResult({ result }: { result: IndividualIncomeResult }) {
  const breakdown = result.bands.map((b) => ({
    range:
      b.upper === null
        ? `Above ${b.lower.toLocaleString("en-US")}`
        : `${b.lower.toLocaleString("en-US")} – ${b.upper.toLocaleString("en-US")}`,
    rate: b.rate,
    amount: b.amountInBand,
    tax: b.tax,
  }));

  const hasBands = breakdown.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Total tax payable"
          value={formatMoney(result.totalTax, result.currency)}
          tone={result.totalTax > 0 ? "positive" : "neutral"}
          sub={result.investmentGainsTax > 0 ? "incl. investment gains" : undefined}
        />
        <Stat
          label="Effective rate"
          value={formatRate(result.effectiveRate)}
          sub={
            result.effectiveRate === 0
              ? "no tax due"
              : result.totalTax > 0
                ? "of assessable income"
                : undefined
          }
        />
        <Stat
          label="Taxable income"
          value={formatMoney(result.taxableAfterRelief, result.currency)}
          sub="after personal relief"
        />
        <Stat
          label="Personal relief"
          value={formatMoney(result.personalReliefApplied, result.currency)}
          sub={`of ${formatMoney(result.personalRelief, result.currency)}`}
        />
      </div>

      <Card>
        <CardHeader
          title="Calculation breakdown"
          subtitle={`${result.ruleset.label} · ${result.ruleset.taxYear}`}
          action={
            <Badge tone={result.ruleset.verified ? "positive" : "warn"}>
              {result.ruleset.verified ? "IRD verified" : "Unverified rules"}
            </Badge>
          }
        />
        <CardBody className="p-0">
          <dl className="grid grid-cols-1 gap-1.5 border-b border-line px-5 py-4 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">Assessable income</dt>
              <dd className="tabular text-ink">
                {formatMoney(result.ordinaryAssessableIncome, result.currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">
                Less: personal relief{" "}
                <span className="text-xs text-ink-faint">
                  (of {formatMoney(result.personalRelief, result.currency)})
                </span>
              </dt>
              <dd className="tabular text-ink-soft">
                – {formatMoney(result.personalReliefApplied, result.currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-1.5">
              <dt className="font-medium text-ink">Taxable income</dt>
              <dd className="font-semibold tabular text-ink">
                {formatMoney(result.taxableAfterRelief, result.currency)}
              </dd>
            </div>
          </dl>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-2.5 font-medium">Bracket</th>
                <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                <th className="px-5 py-2.5 text-right font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {!hasBands ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-sm text-ink-faint">
                    Income was fully covered by the personal relief — no tax due.
                  </td>
                </tr>
              ) : (
                breakdown.map((row) => (
                  <tr key={row.range} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5 tabular">{row.range}</td>
                    <td className="px-5 py-2.5 text-right tabular">{formatRate(row.rate)}</td>
                    <td className="px-5 py-2.5 text-right tabular">
                      {formatMoney(row.amount, result.currency)}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium tabular">
                      {formatMoney(row.tax, result.currency)}
                    </td>
                  </tr>
                ))
              )}
              {result.investmentGainsTax > 0 ? (
                <tr className="border-t border-line-strong bg-surface-dim">
                  <td className="px-5 py-2.5">Investment asset gains</td>
                  <td className="px-5 py-2.5 text-right tabular">{formatRate(result.investmentGainsRate)}</td>
                  <td className="px-5 py-2.5 text-right tabular">
                    {formatMoney(result.investmentAssetGains, result.currency)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-medium tabular">
                    {formatMoney(result.investmentGainsTax, result.currency)}
                  </td>
                </tr>
              ) : null}
              <tr className="border-t border-line-strong bg-surface-dim font-medium">
                <td className="px-5 py-2.5">Total tax payable</td>
                <td className="px-5 py-2.5 text-right tabular text-ink-faint">—</td>
                <td className="px-5 py-2.5 text-right tabular text-ink-faint">—</td>
                <td className="px-5 py-2.5 text-right font-semibold tabular text-ink">
                  {formatMoney(result.totalTax, result.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Audit trail" subtitle="How this result was derived — no AI in the calculation." />
        <CardBody>
          <ol className="flex flex-col gap-2">
            {result.audit.map((step, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-ink-soft">
                  <span className="mr-2 text-ink-faint">{i + 1}.</span>
                  {step.label}
                  {step.detail ? <span className="ml-2 text-ink-faint">{step.detail}</span> : null}
                </span>
                <span className="font-medium tabular">{formatMoney(step.amount, result.currency)}</span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
