"use client";

import { useActionState } from "react";
import { calculateVat, assessVat } from "@/app/actions";
import type { VatState } from "@/app/actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Currency } from "@/lib/tax";
import { VatResult } from "./result";

const EMPTY: VatState = {};

export function VatCalculator({
  taxYear,
  currency,
  label,
  verified,
}: {
  taxYear: string;
  currency: Currency;
  label?: string;
  verified: boolean;
}) {
  const [calcState, calcAction, calcPending] = useActionState(calculateVat, EMPTY);
  const [regState, regAction, regPending] = useActionState(assessVat, EMPTY);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="VAT calculation"
          subtitle={
            label
              ? `${label}. Enter supply values and your deductible input VAT for the period. Amounts are in ${currency}.`
              : `Enter supply values and your deductible input VAT for the period. Amounts are in ${currency}.`
          }
        />
        <CardBody>
          <form action={calcAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Output VAT — taxable supplies
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  name="standardRatedSales"
                  label="Standard-rated supplies"
                  unit={currency}
                  placeholder="0"
                  hint="Goods/services at 18% (excluding financial services)."
                />
                <Field
                  name="zeroRatedSales"
                  label="Zero-rated supplies (exports)"
                  unit={currency}
                  placeholder="0"
                  hint="Exported goods/services at 0%."
                />
                <Field
                  name="financialServicesSales"
                  label="Financial services"
                  unit={currency}
                  placeholder="0"
                  hint="Financial services at the separate rate."
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Input VAT — how much you may credit
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  name="deductibleInputVat"
                  label="Deductible input VAT"
                  unit={currency}
                  placeholder="0"
                  hint="The input VAT you declare as deductible this period."
                />
                <Field
                  name="nonDeductibleInputVat"
                  label="Non-deductible input VAT"
                  unit={currency}
                  placeholder="0"
                  hint="Shown for reference; not credited against output VAT."
                />
              </div>
            </div>

            <ErrorPanel errors={calcState.errors} />

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-ink-faint">
                Tax year <span className="font-medium text-ink-soft">{taxYear}</span> ·
                Sri Lanka · {verified ? "IRD verified" : "Unverified rules"}.
              </p>
              <Button type="submit" disabled={calcPending} className="min-w-36">
                {calcPending ? "Calculating…" : "Calculate VAT"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="VAT registration assessment"
          subtitle="Check whether you must, may, or need not register. Separate from the calculation above."
        />
        <CardBody>
          <form action={regAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="standardQuarterTurnover"
                label="Ordinary taxable supplies — quarter"
                unit={currency}
                placeholder="0"
                hint="Turnover in the current quarter."
              />
              <Field
                name="standardAnnualTurnover"
                label="Ordinary taxable supplies — 12 months"
                unit={currency}
                placeholder="0"
                hint="Turnover over the trailing 12 months."
              />
              <Field
                name="financialQuarterTurnover"
                label="Financial services — quarter"
                unit={currency}
                placeholder="0"
              />
              <Field
                name="financialAnnualTurnover"
                label="Financial services — per annum"
                unit={currency}
                placeholder="0"
              />
              <Field
                name="platformTurnoverLast3Months"
                label="Non-resident e-platform — last 3 months"
                unit={currency}
                placeholder="0"
                hint="Only assessed when the e-platform rule is in force."
              />
              <Field
                name="platformTurnoverLast12Months"
                label="Non-resident e-platform — last 12 months"
                unit={currency}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Checkbox
                name="carriesOutTaxableSupplies"
                label="I carry out taxable supplies"
                hint="Enables voluntary registration below the threshold."
              />
              <Checkbox
                name="importsOrExportsForCommercialPurpose"
                label="I import/export goods for commercial purposes"
                hint="Mandatory registration regardless of turnover."
              />
              <Checkbox
                name="isNonResidentElectronicPlatformSupplier"
                label="I am a non-resident e-platform supplier"
                hint="Assessed from 1 October 2025."
              />
            </div>

            <ErrorPanel errors={regState.errors} />

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-ink-faint">
                Assessed at 1 October 2025 — the date the non-resident e-platform rule is
                in force. Thresholds are exclusive.
              </p>
              <Button type="submit" disabled={regPending} className="min-w-36">
                {regPending ? "Assessing…" : "Assess registration"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <VatResult result={calcState.result} registration={regState.registration} />
    </div>
  );
}

function ErrorPanel({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <div
      role="alert"
      className="grid gap-1 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      <p className="font-medium">Please fix the following:</p>
      <ul className="list-inside list-disc">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function Checkbox({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2.5 rounded-md border border-line bg-surface px-3 py-2.5">
      <input
        type="checkbox"
        name={name}
        className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
      </span>
    </label>
  );
}
