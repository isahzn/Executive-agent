"use client";

import { useActionState, useState } from "react";
import {
  parseUpload,
  calculateIndividualTaxFromInput,
} from "@/app/actions";
import type { IndividualTaxState, UploadState } from "@/app/actions";
import type { IndividualIncomeInput } from "@/lib/tax";
import type { CellValue } from "@/lib/upload/parse";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/tax/money";
import { TaxResult } from "./result";

type FieldKey = keyof IndividualIncomeInput;

const FIELD_LABELS: Array<{ key: FieldKey; label: string; hint?: string }> = [
  { key: "employmentIncome", label: "Employment income" },
  { key: "businessIncome", label: "Business income" },
  { key: "investmentIncome", label: "Investment income" },
  { key: "otherIncome", label: "Other income" },
  { key: "allowableDeductions", label: "Allowable deductions", hint: "Sum is deducted" },
  { key: "investmentAssetGains", label: "Investment asset gains" },
];

const EMPTY_UPLOAD: UploadState = {};
const EMPTY_CALC: IndividualTaxState = {};
const NO_MAP = -1;

function toNumber(value: CellValue): number {
  return typeof value === "number" ? value : 0;
}

export function UploadData() {
  const [upload, uploadAction, parsing] = useActionState(parseUpload, EMPTY_UPLOAD);
  const [mapping, setMapping] = useState<Record<FieldKey, number>>({
    employmentIncome: NO_MAP,
    businessIncome: NO_MAP,
    investmentIncome: NO_MAP,
    otherIncome: NO_MAP,
    allowableDeductions: NO_MAP,
    investmentAssetGains: NO_MAP,
  });
  const [calc, setCalc] = useState<IndividualTaxState>(EMPTY_CALC);
  const [calculating, setCalculating] = useState(false);

  const parsed = upload.parsed;
  const rows = parsed?.rows ?? [];
  const headers = parsed?.headers ?? [];

  const mapSet = (key: FieldKey, value: string) =>
    setMapping((m) => ({ ...m, [key]: value === "" ? NO_MAP : Number(value) }));

  function builtInput(): IndividualIncomeInput {
    const sum = (key: FieldKey) => {
      const idx = mapping[key];
      if (idx === NO_MAP) return 0;
      return rows.reduce(
        (total: number, row) => total + toNumber(row[idx]),
        0
      );
    };
    return {
      employmentIncome: sum("employmentIncome"),
      businessIncome: sum("businessIncome"),
      investmentIncome: sum("investmentIncome"),
      otherIncome: sum("otherIncome"),
      allowableDeductions: sum("allowableDeductions"),
      investmentAssetGains: sum("investmentAssetGains"),
    };
  }

  async function runCalculation() {
    setCalculating(true);
    setCalc(await calculateIndividualTaxFromInput(builtInput()));
    setCalculating(false);
  }

  const preview = rows.slice(0, 8);

  return (
    <Card id="import">
      <CardHeader
        title="Import from file"
        subtitle="Upload a CSV or Excel file, map your columns, then run the calculation. Data is never imported blindly."
      />
      <CardBody className="flex flex-col gap-5">
        <form action={uploadAction} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            className="block text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-navy-soft"
          />
          <Button type="submit" variant="secondary" disabled={parsing}>
            {parsing ? "Parsing…" : "Parse file"}
          </Button>
          {upload.error ? (
            <span role="alert" className="text-sm text-danger">
              {upload.error}
            </span>
          ) : null}
        </form>

        {parsed && rows.length > 0 ? (
          <>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-ink-soft">
                Preview · {parsed.filename}
              </p>
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-surface-dim">
                    <tr>
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, ri) => (
                      <tr key={ri} className="border-t border-line">
                        {headers.map((_, ci) => (
                          <td key={ci} className="px-3 py-2 tabular">
                            {row[ci] != null ? String(row[ci]) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                Showing {preview.length} of {rows.length} rows.
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-ink-soft">
                Map columns to tax fields
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FIELD_LABELS.map((f) => (
                  <Select
                    key={f.key}
                    label={f.label}
                    hint={f.hint}
                    value={mapping[f.key]}
                    onChange={(e) => mapSet(f.key, e.target.value)}
                  >
                    <option value={NO_MAP} disabled>
                      Select a column…
                    </option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </Select>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-1 text-sm">
                  <p className="text-xs text-ink-soft">Mapped totals (summed)</p>
                  {FIELD_LABELS.filter((f) => mapping[f.key] !== NO_MAP).length ===
                  0 ? (
                    <span className="text-xs text-ink-faint">
                      Map at least one column to proceed.
                    </span>
                  ) : (
                    FIELD_LABELS.filter((f) => mapping[f.key] !== NO_MAP).map(
                      (f) => (
                        <span key={f.key} className="text-ink-soft">
                          {f.label}:{" "}
                          <span className="font-medium text-ink">
                            {formatMoney(builtInput()[f.key])}
                          </span>
                        </span>
                      )
                    )
                  )}
                </div>
                <Button
                  onClick={runCalculation}
                  disabled={calculating}
                  className="min-w-40"
                >
                  {calculating ? "Calculating…" : "Calculate from import"}
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {calc.result ? <TaxResult result={calc.result} /> : null}
        {calc.errors?.length ? (
          <div role="alert" className="text-sm text-danger">
            {calc.errors.join("; ")}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
