"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();

  // Get non-soon items for the compact mobile view
  const allItems = NAV_SECTIONS.flatMap((s) => s.items.filter((i) => !i.soon));

  return (
    <>
      {allItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active
              ? "cursor-pointer whitespace-nowrap rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white"
              : "cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-ink-soft hover:bg-surface-dim hover:text-ink"}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
