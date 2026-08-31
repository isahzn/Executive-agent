import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersistence } from "@/lib/database";
import type { SavedCalculation, CalculationType } from "@/lib/database";

export const metadata: Metadata = {
  title: "Calculation History",
};

const TYPE_LABEL: Record<CalculationType, string> = {
  INDIVIDUAL_INCOME: "Individual Income Tax",
  BUSINESS: "Business Tax",
  VAT: "VAT",
  WITHHOLDING: "Withholding Tax",
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

function Row({ calc }: { calc: SavedCalculation }) {
  return (
    <Link
      href={`/history/${calc.id}`}
      className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3.5 py-3 text-sm transition-colors hover:border-line-strong hover:bg-surface-dim sm:gap-4"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Badge tone={TYPE_TONE[calc.type]}>{TYPE_LABEL[calc.type]}</Badge>
        <span className="truncate text-ink">Year of Assessment {calc.taxYear}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-right text-xs text-ink-soft">
        <span className="tabular">{formatDate(calc.createdAt)}</span>
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
          subtitle={`${calculations.length} total · most recent first`}
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
