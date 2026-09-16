import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRate } from "@/lib/tax/money";
import type { WithholdingResult } from "@/lib/tax";

export function WithholdingResult({ result }: { result: WithholdingResult }) {
  const currency = result.currency;
  const subject = result.applies;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Gross payment"
          value={formatMoney(result.gross, currency)}
          sub="before withholding"
        />
        <Stat
          label="WHT rate"
          value={formatRate(result.rate)}
          sub="from the verified ruleset"
        />
        <Stat
          label="Withholding tax"
          value={formatMoney(result.withholding, currency)}
          tone={subject && result.withholding > 0 ? "warn" : "neutral"}
          sub={subject ? "withheld from payment" : "no WHT due"}
        />
        <Stat
          label="Net payment"
          value={formatMoney(result.net, currency)}
          tone="positive"
          sub="after withholding"
        />
      </div>

      <Card>
        <CardHeader
          title="Withholding rule applied"
          subtitle={`${result.ruleset.label}, assessed at ${result.atDate}`}
          action={
            <Badge tone={subject ? "warn" : "neutral"}>
              {subject ? "Subject to WHT" : "No WHT withheld"}
            </Badge>
          }
        />
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink">{result.categoryLabel}</p>
            <p className="text-xs text-ink-soft">
              Rate {formatRate(result.rate)}, from {result.ruleset.source.authority}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-1.5 border-t border-line pt-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">Payment category</dt>
              <dd className="tabular text-ink">{result.category}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">Gross payment</dt>
              <dd className="tabular text-ink">{formatMoney(result.gross, currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">Rate</dt>
              <dd className="tabular text-ink">{formatRate(result.rate)}</dd>
            </div>
            {result.monthlyThreshold != null ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-soft">
                  Monthly threshold{" "}
                  <span className="text-xs text-ink-faint">(exclusive)</span>
                </dt>
                <dd className="tabular text-ink">
                  {formatMoney(result.monthlyThreshold, currency)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-1.5">
              <dt className="font-medium text-ink">Withholding tax</dt>
              <dd className="font-semibold tabular text-warn">
                {formatMoney(result.withholding, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-medium text-ink">Net payment</dt>
              <dd className="font-semibold tabular text-accent">
                {formatMoney(result.net, currency)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {result.monthlyThreshold != null ? (
        <Card>
          <CardHeader
            title="Threshold check"
            subtitle="Whether the aggregate monthly payment exceeds the threshold and WHT applies."
          />
          <CardBody>
            <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-soft">
                  Monthly threshold
                </dt>
                <dd className="tabular text-ink">
                  {formatMoney(result.monthlyThreshold, currency)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-soft">
                  Aggregate this month
                </dt>
                <dd className="tabular text-ink">
                  {result.monthlyAggregate == null
                    ? "—"
                    : formatMoney(result.monthlyAggregate, currency)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-soft">
                  Result
                </dt>
                <dd className={`tabular font-medium ${result.thresholdMet ? "text-warn" : "text-ink"}`}>
                  {result.thresholdMet ? "Exceeded — WHT applies" : "Not exceeded — no WHT"}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>
      ) : null}

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
                <span className="font-medium tabular">{formatMoney(step.amount, currency)}</span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
