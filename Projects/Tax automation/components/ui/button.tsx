import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-soft focus-visible:outline-navy-soft",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-dim",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-dim hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={[
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-medium",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
