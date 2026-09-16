import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "positive"
  | "negative"
  | "warn"
  | "info"
  | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-dim text-ink-soft border-line",
  positive: "bg-accent-soft text-accent border-transparent",
  negative: "bg-danger-soft text-danger border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  info: "bg-navy-tint text-navy-soft border-transparent",
  brand: "bg-navy text-white border-transparent",
};

/**
 * Status chips. Small radius (rounded-sm) — chips are the smallest
 * containers in the hierarchy scale. Sentence case text.
 */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
