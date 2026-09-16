"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-items";

function NavLink({ href, label, soon }: { href: string; label: string; soon?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active
        ? "flex cursor-pointer items-center justify-between gap-2 rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white"
        : "flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm text-ink-soft hover:bg-surface-dim hover:text-ink"}
    >
      <span>{label}</span>
      {soon ? (
        <span className="rounded-sm bg-line px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
          Soon
        </span>
      ) : null}
    </Link>
  );
}

export function AppNav() {
  return (
    <nav className="flex flex-col gap-6" aria-label="Primary">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="flex flex-col gap-1.5">
          <p className="px-3 text-[11px] font-semibold text-ink-faint">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
