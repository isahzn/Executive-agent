import type { InputHTMLAttributes, ReactNode } from "react";

/** Labeled numeric/text input used across the tax forms. */
export function Field({
  label,
  hint,
  error,
  unit,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  unit?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          className={[
            "h-10 w-full rounded-md border bg-surface px-3 text-sm tabular text-ink",
            "placeholder:text-ink-faint",
            error ? "border-danger" : "border-line focus:border-navy-soft",
          ].join(" ")}
          {...props}
        />
        {unit ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-ink-faint">
            {unit}
          </span>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

/** Plain text label helper for non-input rows. */
export function FormLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-ink">{children}</span>;
}
