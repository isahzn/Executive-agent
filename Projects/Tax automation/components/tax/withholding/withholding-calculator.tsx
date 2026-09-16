"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { calculateWithholding } from "@/app/actions";
import type { WithholdingState } from "@/app/actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatRate } from "@/lib/tax/money";
import type { Currency, WhtPaymentCategory } from "@/lib/tax";
import { WithholdingResult } from "./result";

export type WhtCategoryOption = {
  key: WhtPaymentCategory;
  label: string;
  rate: number;
  monthlyThreshold: number | null;
};

const EMPTY: WithholdingState = {};

export function WithholdingCalculator({
  taxYear,
  currency,
  label,
  verified,
  categories,
}: {
  taxYear: string;
  currency: Currency;
  label?: string;
  verified: boolean;
  categories: WhtCategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(calculateWithholding, EMPTY);
  const [category, setCategory] = useState<WhtPaymentCategory>(categories[0]?.key);
  const selected = categories.find((c) => c.key === category);
  const needsAggregate = selected?.monthlyThreshold != null;

  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result
  useEffect(() => {
    if (state.result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.result]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Withholding details"
          subtitle={
            label
              ? `${label}. Select the payment type and enter the gross amount. Amounts are in ${currency}.`
              : `Select the payment type and enter the gross amount. Amounts are in ${currency}.`
          }
        />
        <CardBody>
          <form action={formAction} className="flex flex-col gap-5">
            <Select
              name="category"
              label="Payment category"
              hint="The rate and any threshold apply as encoded in the verified ruleset."
              value={category}
              onChange={(e) => setCategory(e.target.value as WhtPaymentCategory)}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} — {formatRate(c.rate)}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="gross"
                label="Gross payment"
                unit={currency}
                placeholder="0"
                hint="The payment amount before withholding."
              />
              {needsAggregate ? (
                <Field
                  name="monthlyAggregate"
                  label="Total to this recipient this month"
                  unit={currency}
                  placeholder="0"
                  hint="Required to check the monthly threshold. WHT applies when this exceeds the threshold."
                />
              ) : null}
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
                Tax year {taxYear}, Sri Lanka.{" "}
                {verified ? "Verified against IRD publications." : "Unverified rules."}
              </p>
              <Button type="submit" disabled={pending} className="min-w-36">
                {pending ? "Calculating…" : "Calculate withholding"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {state.result ? (
        <div ref={resultRef}>
          <WithholdingResult result={state.result} />
        </div>
      ) : null}
    </div>
  );
}
