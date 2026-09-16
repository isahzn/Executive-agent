import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersistence } from "@/lib/database";
import type { SavedCalculation, CalculationType } from "@/lib/database";
import { formatMoney } from "@/lib/tax/money";

export const metadata: Metadata = {
  title: "Calculation History",
};

const TYPE_LABEL: Record<CalculationType, string> = {
  INDIVIDUAL_INCOME: "Individual income tax",
  BUSINESS: "Business tax",
  VAT: "VAT",
  WITHHOLDING: "Withholding tax",
};

const TYPE_TONE: Record<CalculationType, "info" | "neutral" | "warn" | "positive"> = {
  INDIVIDUAL_INCOME: "info",
  BUSINESS: "warn",
  VAT: "neutral",
  WITHHOLDING: "positive",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("en-US");
}

/** Extract a summary figure from a saved calculation for display in history rows. */
function extractSummary(calc: SavedCalculation): string {
  const result = calc.result as Record<string, unknown>;
  switch (calc.type) {
    case "INDIVIDUAL_INCOME": {
      const totalTax = (result.totalTax as number) ?? 0;
      return formatMoney(totalTax, "LKR");
    }
    case "VAT": {
      const netVat = (result.netVat as number) ?? 0;
      const position = (result.position as string) ?? "NIL";
      if (position === "PAYABLE") return `Payable ${formatMoney(netVat, "LKR")}`;
      if (position === "REFUNDABLE") return `Refund ${formatMoney(Math.abs(netVat), "LKR")}`;
      return "Nil";
    }
    case "WITHHOLDING": {
      const withholding = (result.withholding as number) ?? 0;
      return formatMoney(withholding, "LKR");
    }
    case "BUSINESS": {
      const totalTax = (result.totalTax as number) ?? null;
      const taxStatus = (result.taxStatus as string) ?? "NOT_IMPLEMENTED";
      if (totalTax != null) return formatMoney(totalTax, "LKR");
      if (taxStatus === "NEEDS_ALLOCATION") return "Needs allocation";
      return "Pending";
    }
    default:
      return "—";
  }
}

function Row({ calc }: { calc: SavedCalculation }) {
  return (
    <Link
      href={`/history/${calc.id}`}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line bg-surface px-3.5 py-3 text-sm transition-colors hover:border-line-strong hover:bg-surface-dim sm:gap-4"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Badge tone={TYPE_TONE[calc.type]}>{TYPE_LABEL[calc.type]}</Badge>
        <span className="truncate text-ink">Year of Assessment {calc.taxYear}</span>
      </span>
      <span className="flex shrink-0 items-center gap-4">
        <span className="tabular font-medium text-ink hidden sm:inline">{extractSummary(calc)}</span>
        <span className="flex flex-col items-end gap-0.5 text-right text-xs text-ink-soft">
          <span className="tabular">{formatDate(calc.createdAt)}</span>
        </span>
      </span>
    </Link>
  );
}

export default async function HistoryPage() {
  const calculations = await getPersistence().list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calculation History"
        subtitle="Every completed calculation is saved with its exact inputs, applied rule version, result and audit trail. Reopen one to see exactly how it was derived."
      />

      <Card>
        <CardHeader
          title="Saved calculations"
          subtitle={`${calculations.length} saved, most recent first`}
        />
        <CardBody>
          {calculations.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No calculations saved yet. Complete a tax calculation and it will appear here so
              you can reopen it later.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {calculations.map((c) => (
                <li key={c.id}>
                  <Row calc={c} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
