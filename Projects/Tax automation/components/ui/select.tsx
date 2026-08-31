import type { SelectHTMLAttributes, ReactNode } from "react";

/** Labeled select input styled to match the Field component. */
export function Select({
  label,
  hint,
  error,
  children,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        className={[
          "h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink",
          error ? "border-danger" : "border-line focus:border-navy-soft",
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}
