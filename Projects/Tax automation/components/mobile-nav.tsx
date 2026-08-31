"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-items";

const items = NAV_SECTIONS.flatMap((s) => s.items).filter((i) => !i.soon);

export function MobileNav() {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm",
              active
                ? "bg-navy text-white"
                : "text-ink-soft hover:bg-surface-dim hover:text-ink",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
