"use client";

import { useActionState } from "react";
import { calculateBusinessTax } from "@/app/actions";
import type { BusinessTaxState } from "@/app/actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Currency } from "@/lib/tax";
import { BusinessTaxResult } from "./result";

const EMPTY: BusinessTaxState = {};

const INCOME_FIELDS: Array<{
  name: "standardIncome" | "foreignCcyServiceIncome" | "foreignCcyForeignSourceIncome" | "bettingGamingIncome" | "liquorTobaccoIncome" | "investmentAssetGains";
  label: string;
  hint: string;
}> = [
  { name: "standardIncome", label: "Ordinary business income", hint: "Standard company taxable income (before expenses)." },
  { name: "foreignCcyServiceIncome", label: "Foreign-currency service income", hint: "Qualifying foreign-currency service income remitted through a bank." },
  { name: "foreignCcyForeignSourceIncome", label: "Foreign-source income (FC)", hint: "Qualifying foreign-source income in foreign currency remitted through a bank." },
  { name: "bettingGamingIncome", label: "Betting & gaming", hint: "Betting and gaming income." },
  { name: "liquorTobaccoIncome", label: "Liquor & tobacco", hint: "Income from manufacture/import and sale of liquor or tobacco." },
  { name: "investmentAssetGains", label: "Investment-asset gains", hint: "Gains from realisation of investment assets (separate 30% rate)." },
];

const EXPENSE_FIELDS: Array<{
  name: "costOfGoodsSold" | "operatingExpenses" | "otherAllowableExpenses" | "capitalAllowances" | "otherDeductions";
  label: string;
  hint: string;
}> = [
  { name: "costOfGoodsSold", label: "Cost of goods sold", hint: "Direct cost of goods/services sold." },
  { name: "operatingExpenses", label: "Operating expenses", hint: "Rent, utilities, salaries, admin — as allowable." },
  { name: "otherAllowableExpenses", label: "Other allowable expenses", hint: "Any other allowable deductions you claim." },
  { name: "capitalAllowances", label: "Capital allowances", hint: "Depreciation / capital allowances claimed." },
  { name: "otherDeductions", label: "Other deductions", hint: "Any other deductions you claim." },
];

export function BusinessCalculator({
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
  const [state, formAction, pending] = useActionState(calculateBusinessTax, EMPTY);
  const result = state.result;

  return (
    <div className="flex flex-col gap-6">
      {!verified ? (
        <div
          role="status"
          className="grid gap-1 rounded-md border border-warn/30 bg-warn-soft px-3 py-2.5 text-sm text-warn"
        >
          <p className="font-medium">Module incomplete — awaiting verified rules</p>
          <p>
            No authoritative Sri Lankan business (company) tax rate is encoded yet, so{" "}
            <span className="font-medium">taxable profit is computed but tax payable is reported as
            NOT_IMPLEMENTED</span>. No rate, band or relief has been guessed. It becomes a full
            calculation once an official IRD 2025/2026 business tax source is added.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Business income"
          subtitle={
            label
              ? `${label}. Enter business income by category, then declared allowable expenses. Amounts are in ${currency}.`
              : `Enter business income by category, then declared allowable expenses. Amounts are in ${currency}.`
          }
        />
        <CardBody>
          <form action={formAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {INCOME_FIELDS.map((f) => (
                <Field
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  unit={currency}
                  placeholder="0"
                  hint={f.hint}
                />
              ))}
            </div>

            <div className="grid gap-1 rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink-soft">
              <p className="font-medium text-ink">Declared allowable expenses</p>
              <p>
                These reduce <span className="font-medium text-ink">ordinary business income only</span>.
                The 15%/45% categories and investment-asset gains are computed on gross — declared
                expenses are not allocated to them and no cross-category offset is applied.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EXPENSE_FIELDS.map((f) => (
                <Field
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  unit={currency}
                  placeholder="0"
                  hint={f.hint}
                />
              ))}
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
                Tax year <span className="font-medium text-ink-soft">{taxYear}</span> · Sri Lanka
                · {verified ? "IRD verified" : "Awaiting verified rules"}.
              </p>
              <Button type="submit" disabled={pending} className="min-w-36">
                {pending ? "Calculating…" : "Calculate business tax"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {result ? <BusinessTaxResult result={result} /> : null}
    </div>
  );
}
