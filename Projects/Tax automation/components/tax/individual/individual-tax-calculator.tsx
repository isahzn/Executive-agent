"use client";

import { useActionState } from "react";
import { calculateIndividualTax } from "@/app/actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { IndividualTaxState } from "@/app/actions";
import type { Currency } from "@/lib/tax";
import { TaxResult } from "./result";

const EMPTY_STATE: IndividualTaxState = {};

export function IndividualTaxCalculator({
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
  const [state, formAction, pending] = useActionState(calculateIndividualTax, EMPTY_STATE);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Income details"
          subtitle={
            label
              ? `${label}. Enter assessable income for the period. Amounts are in ${currency}.`
              : `Enter assessable income for the period. Amounts are in ${currency}.`
          }
        />
        <CardBody>
          <form action={formAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field name="employmentIncome" label="Employment income" unit={currency} placeholder="0" />
              <Field name="businessIncome" label="Business income" unit={currency} placeholder="0" />
              <Field name="investmentIncome" label="Investment income" unit={currency} placeholder="0" />
              <Field name="otherIncome" label="Other income" unit={currency} placeholder="0" />
              <Field
                name="allowableDeductions"
                label="Allowable deductions"
                unit={currency}
                placeholder="0"
                hint="Qualifying expenses, allowances and exemptions."
              />
              <Field
                name="investmentAssetGains"
                label="Investment asset gains"
                unit={currency}
                placeholder="0"
                hint="Taxed at a separate rate; not reduced by personal relief."
              />
            </div>

            {state.errors?.length ? (
              <div
                role="alert"
                className="grid gap-1 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
              >
                <p className="font-medium">Please fix the following:</p>
                <ul className="list-inside list-disc">
                  {state.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-ink-faint">
                Tax year <span className="font-medium text-ink-soft">{taxYear}</span> ·
                Sri Lanka · {verified ? "IRD verified" : "Unverified rules"}.
              </p>
              <Button type="submit" disabled={pending} className="min-w-36">
                {pending ? "Calculating…" : "Calculate tax"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {state.result ? <TaxResult result={state.result} /> : null}
    </div>
  );
}
