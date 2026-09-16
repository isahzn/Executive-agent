"use client";

import { useActionState, useRef, useEffect } from "react";
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
  name: "ordinaryExpenses" | "foreignCcyServiceExpenses" | "foreignCcyForeignSourceExpenses" | "bettingGamingExpenses" | "liquorTobaccoExpenses";
  label: string;
  hint: string;
}> = [
  { name: "ordinaryExpenses", label: "Ordinary business income expenses", hint: "Expenses directly linked to ordinary business income. Reduces that source only." },
  { name: "foreignCcyServiceExpenses", label: "Foreign-currency service expenses", hint: "Expenses directly linked to foreign-currency service income. Reduces that source only." },
  { name: "foreignCcyForeignSourceExpenses", label: "Foreign-source income expenses", hint: "Expenses directly linked to foreign-source income (foreign currency). Reduces that source only." },
  { name: "bettingGamingExpenses", label: "Betting & gaming expenses", hint: "Expenses directly linked to betting and gaming income. Reduces that source only." },
  { name: "liquorTobaccoExpenses", label: "Liquor & tobacco expenses", hint: "Expenses directly linked to liquor/tobacco income. Reduces that source only." },
];

const SHARED_FIELD: {
  name: "sharedExpenses";
  label: string;
  hint: string;
} = {
  name: "sharedExpenses",
  label: "Shared / unallocated expenses",
  hint: "Expenses you cannot attribute to a single income source. Not deducted — the calculation holds at NEEDS ALLOCATION until you attribute them.",
};

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

  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

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
            pending</span>. No rate, band or relief has been guessed. It becomes a full
            calculation once an official IRD 2025/2026 business tax source is added.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Business income"
          subtitle={
            label
              ? `${label}. Enter business income by category, then attribute each expense to the income source it relates to. Amounts are in ${currency}.`
              : `Enter business income by category, then attribute each expense to the income source it relates to. Amounts are in ${currency}.`
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
              <p className="font-medium text-ink">Attributable expenses</p>
              <p>
                Each income source taxed at a different rate is a separate business (Inland Revenue
                Act s60(2)), so enter an expense under the income source it{" "}
                <span className="font-medium text-ink">directly relates to</span> — it reduces only
                that source. Investment-asset gains are computed on gross and take no expenses.
                Expenses you cannot attribute to one source go in{" "}
                <span className="font-medium text-warn">Shared / unallocated expenses</span> below:
                they are <span className="font-medium text-warn">never deducted</span> until you
                attribute them, and the liability is withheld rather than guessed.
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
              <Field
                name={SHARED_FIELD.name}
                label={SHARED_FIELD.label}
                unit={currency}
                placeholder="0"
                hint={SHARED_FIELD.hint}
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
                Tax year {taxYear}, Sri Lanka.{" "}
                {verified ? "Verified against IRD publications." : "Awaiting verified rules."}
              </p>
              <Button type="submit" disabled={pending} className="min-w-36">
                {pending ? "Calculating…" : "Calculate business tax"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {result ? (
        <div ref={resultRef}>
          <BusinessTaxResult result={result} />
        </div>
      ) : null}
    </div>
  );
}
