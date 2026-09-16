import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRate } from "@/lib/tax/money";
import type { BusinessTaxResult } from "@/lib/tax";

const STATUS_BADGE: Record<BusinessTaxResult["taxStatus"], { label: string; tone: "warn" | "info" | "neutral" }> = {
  COMPUTED: { label: "Tax computed", tone: "warn" },
  NEEDS_ALLOCATION: { label: "Expenses need allocation", tone: "info" },
  NOT_IMPLEMENTED: { label: "Tax rate pending", tone: "neutral" },
};

export function BusinessTaxResult({ result }: { result: BusinessTaxResult }) {
  const currency = result.currency;
  const computed = result.taxStatus === "COMPUTED";
  const needsAllocation = result.taxStatus === "NEEDS_ALLOCATION";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total gross income" value={formatMoney(result.totalGrossIncome, currency)} sub="all sources" />
        <Stat label="Attributable expenses" value={formatMoney(result.allowableExpenses, currency)} sub="deducted per source" />
        <Stat
          label="Taxable income"
          value={formatMoney(result.totalTaxableIncome, currency)}
          sub="after attributed expenses"
        />
        <Stat
          label="Tax payable"
          value={computed ? formatMoney(result.totalTax ?? 0, currency) : "Pending"}
          tone={computed ? "warn" : "neutral"}
          sub={computed ? "sum of category tax" : needsAllocation ? "awaiting expense allocation" : "no verified rate yet"}
        />
      </div>

      {needsAllocation ? (
        <div
          role="status"
          className="grid gap-1.5 rounded-md border border-navy-soft bg-navy-tint px-3 py-2.5 text-sm"
          style={{ color: "var(--color-navy-soft)" }}
        >
          <p className="font-medium">
            {formatMoney(result.unallocatedExpenses, currency)} of expenses need to be allocated
          </p>
          <p>
            These expenses cannot be linked to a single income source yet, so the engine holds the
            tax calculation until you <span className="font-medium">attribute them to a specific
            income source</span> (or remove them). This ensures no expense is incorrectly assigned
            to the wrong income category.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Computation"
          subtitle={`${result.ruleset.label}, assessed at ${result.atDate}`}
          action={<Badge tone={STATUS_BADGE[result.taxStatus].tone}>{STATUS_BADGE[result.taxStatus].label}</Badge>}
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold text-ink-soft">
                  <th className="px-3 py-2 font-medium">Income source</th>
                  <th className="px-3 py-2 text-right font-medium">Gross</th>
                  <th className="px-3 py-2 text-right font-medium">Attributable expenses</th>
                  <th className="px-3 py-2 text-right font-medium">Net taxable</th>
                </tr>
              </thead>
              <tbody>
                {result.components.map((c) => (
                  <tr key={c.category} className="border-t border-line">
                    <td className="whitespace-nowrap px-3 py-2 text-ink">
                      {c.label}
                      {c.note ? <span className="ml-1.5 text-xs text-ink-faint">{c.note}</span> : null}
                    </td>
                    <td className="px-3 py-2 text-right tabular text-ink">{formatMoney(c.gross, currency)}</td>
                    <td className="px-3 py-2 text-right tabular text-ink">
                      {c.netted ? (
                        <span>
                          <span className="text-ink-soft">−&nbsp;</span>
                          {formatMoney(c.expenses, currency)}
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular text-ink">{formatMoney(c.taxable, currency)}</td>
                  </tr>
                ))}
                {result.unallocatedExpenses > 0 ? (
                  <tr className="border-t border-line">
                    <td className="px-3 py-2 text-ink">
                      Shared / unallocated expenses
                      <span className="ml-1.5 text-xs text-ink-faint">not deducted</span>
                    </td>
                    <td className="px-3 py-2 text-right" />
                    <td className="px-3 py-2 text-right tabular text-warn">{formatMoney(result.unallocatedExpenses, currency)}</td>
                    <td className="px-3 py-2 text-right tabular text-ink-faint">—</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line-strong">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-ink">Total</td>
                  <td className="px-3 py-2 text-right tabular text-ink">{formatMoney(result.totalGrossIncome, currency)}</td>
                  <td className="px-3 py-2 text-right tabular text-ink">{formatMoney(result.allowableExpenses, currency)}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular text-ink">{formatMoney(result.totalTaxableIncome, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Investment-asset gains are computed on gross — no expense deduction. Each other income
            source is reduced only by the expenses attributed to it; no expense moves between sources.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Applicable business tax"
          subtitle={
            computed
              ? "Each income source is taxed at its verified rate; expenses reduce only the source they are attributed to."
              : "Tax liability cannot be shown yet — see below for details."
          }
          action={
            computed ? <Badge tone="warn">{formatMoney(result.totalTax ?? 0, currency)}</Badge> : <Badge tone="neutral">Pending</Badge>
          }
        />
        <CardBody>
          {computed ? (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold text-ink-soft">
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 text-right font-medium">Taxable</th>
                      <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                      <th className="px-5 py-2.5 text-right font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.components.map((c) => (
                      <tr key={c.category} className="border-t border-line">
                        <td className="px-5 py-2.5 text-ink">{c.label}</td>
                        <td className="px-5 py-2.5 text-right tabular text-ink">{formatMoney(c.taxable, currency)}</td>
                        <td className="px-5 py-2.5 text-right tabular text-ink">{c.rate != null ? formatRate(c.rate) : "—"}</td>
                        <td className="px-5 py-2.5 text-right font-semibold tabular text-warn">{c.tax != null ? formatMoney(c.tax, currency) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-line-strong">
                      <td className="px-5 py-2.5 font-medium text-ink">Total taxable income</td>
                      <td className="px-5 py-2.5 text-right tabular text-ink">{formatMoney(result.totalTaxableIncome, currency)}</td>
                      <td className="px-5 py-2.5" />
                      <td className="px-5 py-2.5 text-right font-semibold tabular text-warn">{formatMoney(result.totalTax ?? 0, currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-ink-faint">
                Investment-asset gains are separately calculated at 30% on gross. Each other category is
                reduced only by expenses attributed to that source; no cross-category offset is applied.
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              {needsAllocation ? (
                <>
                  The tax calculation is <span className="font-medium text-ink">waiting</span> because{" "}
                  <span className="font-medium text-ink">{formatMoney(result.unallocatedExpenses, currency)}</span>{" "}
                  of expenses are shared / unallocated. Attribute them to a specific income source, or
                  remove them, to compute the tax liability. The engine never guesses where an expense belongs.
                </>
              ) : (
                <>
                  The tax calculation is <span className="font-medium text-ink">pending</span> because no
                  verified IRD business tax rate is available for every income source entered. Taxable income
                  is computed here; the tax liability will appear once an authoritative rate is added to the
                  versioned rules.
                </>
              )}
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
                  {isWithheld(step.amount, step.detail) ? "—" : formatMoney(step.amount, currency)}
                </span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

function isWithheld(amount: number, detail?: string): boolean {
  return (
    amount === 0 &&
    !!detail &&
    (detail.startsWith("NOT IMPLEMENTED") || detail.startsWith("NEEDS ALLOCATION"))
  );
}
