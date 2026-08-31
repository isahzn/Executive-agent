import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * The verified/unverified ruleset chip shown in the header of each tax page.
 * Centralised so every page shows the same status treatment.
 */
export function RulesetBadge({
  verified,
  taxYear,
}: {
  verified: boolean;
  taxYear: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        verified
          ? "border-accent/30 bg-accent-soft text-accent"
          : "border-warn/30 bg-warn-soft text-warn",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "h-1.5 w-1.5 rounded-full",
          verified ? "bg-accent" : "bg-warn",
        ].join(" ")}
      />
      {verified ? "IRD verified" : "Unverified"} · {taxYear}
    </span>
  );
}
