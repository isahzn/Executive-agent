import type { ReactNode } from "react";

/**
 * Containers — radius scales with hierarchy:
 * page-level panels use rounded-lg, nested items use rounded-md,
 * inline chips use rounded-sm. One consistent shadow only.
 */
export function Card({
  children,
  className = "",
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={[
        "rounded-lg border border-line bg-surface",
        "shadow-[0_1px_2px_rgba(30,58,95,0.06)]",
        id ? "scroll-mt-24" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
