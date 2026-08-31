import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRate } from "@/lib/tax/money";
import type {
  VatCalculationResult,
  VatRegistrationAssessment,
  VatSupplyCategory,
  VatPosition,
} from "@/lib/tax";

const SUPPLY_LABEL: Record<VatSupplyCategory, string> = {
  STANDARD: "Standard-rated supplies",
  ZERO_RATED: "Zero-rated supplies (exports)",
  FINANCIAL_SERVICES: "Financial services",
};

const POSITION_LABEL: Record<VatPosition, string> = {
  PAYABLE: "Payable",
  REFUNDABLE: "Refundable",
  NIL: "Nil",
};

const POSITION_TONE: Record<VatPosition, "positive" | "warn" | "neutral"> = {
  PAYABLE: "positive",
  REFUNDABLE: "warn",
  NIL: "neutral",
};

const REG_STATUS_TONE: Record<
  VatRegistrationAssessment["status"],
  "warn" | "info" | "neutral"
> = {
  MANDATORY: "warn",
  VOLUNTARY: "info",
  NOT_REQUIRED: "neutral",
};

const REG_STATUS_LABEL: Record<VatRegistrationAssessment["status"], string> = {
  MANDATORY: "Registration required",
  VOLUNTARY: "Voluntary registration",
  NOT_REQUIRED: "Registration not required",
};

export function VatResult({
  result,
  registration,
}: {
  result?: VatCalculationResult;
  registration?: VatRegistrationAssessment;
}) {
  return (
    <div className="flex flex-col gap-6">
      {result ? <VatBreakdown result={result} /> : null}
      {registration ? <RegistrationAssessment result={registration} /> : null}
    </div>
  );
}

function VatBreakdown({ result }: { result: VatCalculationResult }) {
  const currency = result.currency;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Output VAT"
          value={formatMoney(result.outputVat, currency)}
          sub={
            result.outputVat > 0
              ? "across taxable supplies"
              : "no output VAT due"
          }
        />
        <Stat
          label="Input VAT (creditable)"
          value={formatMoney(result.creditableInputVat, currency)}
          sub="deductible purchases"
        />
        <Stat
          label="Net VAT"
          value={formatMoney(result.netVat, currency)}
          tone={POSITION_TONE[result.position]}
          sub={
            result.position === "PAYABLE"
              ? "amount payable"
              : result.position === "REFUNDABLE"
                ? "amount refundable"
                : "nothing due"
          }
        />
        <Stat
          label="Position"
          value={POSITION_LABEL[result.position]}
          tone={POSITION_TONE[result.position]}
          sub={result.position === "REFUNDABLE" ? "credit / carry-forward" : undefined}
        />
      </div>

      <Card>
        <CardHeader
          title="VAT calculation breakdown"
          subtitle={`${result.ruleset.label} · ${result.ruleset.taxYear}`}
          action={
            <Badge tone={result.ruleset.verified ? "positive" : "warn"}>
              {result.ruleset.verified ? "IRD verified" : "Unverified rules"}
            </Badge>
          }
        />
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-2.5 font-medium">Supply category</th>
                <th className="px-5 py-2.5 text-right font-medium">Rate</th>
                <th className="px-5 py-2.5 text-right font-medium">Value</th>
                <th className="px-5 py-2.5 text-right font-medium">Output VAT</th>
              </tr>
            </thead>
            <tbody>
              {result.categories.map((c) => (
                <tr key={c.category} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5">{SUPPLY_LABEL[c.category]}</td>
                  <td className="px-5 py-2.5 text-right tabular">{formatRate(c.rate)}</td>
                  <td className="px-5 py-2.5 text-right tabular">
                    {formatMoney(c.amount, currency)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-medium tabular">
                    {formatMoney(c.outputVat, currency)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-line-strong bg-surface-dim font-medium">
                <td className="px-5 py-2.5">Total output VAT</td>
                <td className="px-5 py-2.5 text-right tabular text-ink-faint">—</td>
                <td className="px-5 py-2.5 text-right tabular text-ink-faint">—</td>
                <td className="px-5 py-2.5 text-right font-semibold tabular text-ink">
                  {formatMoney(result.outputVat, currency)}
                </td>
              </tr>
            </tbody>
          </table>

          <dl className="grid grid-cols-1 gap-1.5 border-t border-line px-5 py-4 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">Less: deductible input VAT</dt>
              <dd className="tabular text-ink-soft">
                – {formatMoney(result.creditableInputVat, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">
                Non-deductible input VAT{" "}
                <span className="text-xs text-ink-faint">(not credited)</span>
              </dt>
              <dd className="tabular text-ink-soft">
                {formatMoney(result.nonDeductibleInputVat, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-1.5">
              <dt className="font-medium text-ink">
                Net VAT ({POSITION_LABEL[result.position].toLowerCase()})
              </dt>
              <dd
                className={`font-semibold tabular ${
                  result.position === "PAYABLE" ? "text-accent" : result.position === "REFUNDABLE" ? "text-warn" : "text-ink"
                }`}
              >
                {formatMoney(result.netVat, currency)}
              </dd>
            </div>
          </dl>
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
                <span className="font-medium tabular">{formatMoney(step.amount, currency)}</span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </>
  );
}

function RegistrationAssessment({ result }: { result: VatRegistrationAssessment }) {
  const currency = "LKR" as const;
  return (
    <Card>
      <CardHeader
        title="VAT registration assessment"
        subtitle={`${result.ruleset.label} · assessed at ${result.atDate}`}
        action={
          <Badge tone={REG_STATUS_TONE[result.status]}>
            {REG_STATUS_LABEL[result.status]}
          </Badge>
        }
      />
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-soft">{result.reason}</p>
          {result.category ? (
            <p className="text-xs text-ink-faint">
              Driving category: {result.category}
            </p>
          ) : null}
        </div>

        {result.details.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface-dim">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-2 font-medium">Check</th>
                  <th className="px-4 py-2 text-right font-medium">Threshold</th>
                  <th className="px-4 py-2 text-right font-medium">Turnover</th>
                  <th className="px-4 py-2 text-right font-medium">Exceeds</th>
                </tr>
              </thead>
              <tbody>
                {result.details.map((d, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2">
                      {d.label}
                      {d.note ? <span className="ml-2 text-xs text-ink-faint">{d.note}</span> : null}
                    </td>
                    <td className="px-4 py-2 text-right tabular">
                      {d.threshold == null ? "—" : formatMoney(d.threshold, currency)}
                    </td>
                    <td className="px-4 py-2 text-right tabular">
                      {d.turnover == null ? "—" : formatMoney(d.turnover, currency)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular">
                      {d.meets ? (
                        <span className="text-warn">Yes</span>
                      ) : (
                        <span className="text-ink-faint">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink-faint">
            No turnover was provided, so no threshold was compared.
          </p>
        )}

        <div className="border-t border-line pt-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-soft">Audit trail</p>
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
        </div>
      </CardBody>
    </Card>
  );
}
