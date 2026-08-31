import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersistence } from "@/lib/database";
import type { CalculationType } from "@/lib/database";
import { HistoryResult } from "@/components/history/result-view";

const TYPE_LABEL: Record<CalculationType, string> = {
  INDIVIDUAL_INCOME: "Individual Income Tax",
  BUSINESS: "Business Tax",
  VAT: "VAT",
  WITHHOLDING: "Withholding Tax",
};

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const saved = await getPersistence().get(id);
  return { title: saved ? `${TYPE_LABEL[saved.type]} — ${saved.taxYear}` : "Calculation" };
}

export default async function HistoryDetailPage({ params }: Params) {
  const { id } = await params;
  const saved = await getPersistence().get(id);
  if (!saved) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reopened calculation"
        subtitle={`${TYPE_LABEL[saved.type]} · Year of Assessment ${saved.taxYear}. Reopened with its exact inputs and applied rule version.`}
        action={
          <Link
            href="/history"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-surface-dim hover:text-ink"
          >
            <span aria-hidden>←</span> History
          </Link>
        }
      />

      <Card>
        <CardHeader title="Calculation details" subtitle="The parameters this result was computed under." />
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-3">
            <Detail label="Type" value={TYPE_LABEL[saved.type]} />
            <Detail label="Tax year" value={saved.taxYear} />
            <Detail label="Assessed at" value={saved.atDate} />
            <Detail label="Applied rule version" value={saved.rulesetId} accent />
            <Detail label="Completed" value={formatDate(saved.createdAt)} />
            <Detail label="User" value={saved.user} />
          </dl>
        </CardBody>
      </Card>

      <div className="grid gap-1.5 text-sm text-ink-soft">
        <p>
          The audit trail below reproduces exactly how this result was derived from the recorded
          inputs. No AI figure is included — the deterministic rule engine is the source of truth.
        </p>
        <Badge tone="info" className="w-fit">
          Stored rule version: {saved.rulesetId}
        </Badge>
      </div>

      <HistoryResult saved={saved} />
    </div>
  );
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className={`tabular ${accent ? "font-semibold text-accent" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("en-US");
}
