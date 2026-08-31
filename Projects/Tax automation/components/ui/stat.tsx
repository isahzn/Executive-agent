import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "warn";

const TONES: Record<Tone, string> = {
  neutral: "text-ink",
  positive: "text-accent",
  negative: "text-danger",
  warn: "text-warn",
};

/** A KPI value with a label — the core dashboard metric tile. */
export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <span className={`tabular text-2xl font-semibold leading-none ${TONES[tone]}`}>
        {value}
      </span>
      {sub ? <span className="text-xs text-ink-faint">{sub}</span> : null}
    </div>
  );
}
