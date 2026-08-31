import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "warn" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-dim text-ink-soft border-line",
  positive: "bg-accent-soft text-accent border-transparent",
  negative: "bg-danger-soft text-danger border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  info: "bg-[#e9eef4] text-navy-soft border-transparent",
};

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
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
