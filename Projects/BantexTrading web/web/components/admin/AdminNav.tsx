"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="admin-nav">
      <div className="admin-nav__brand">
        <span className="admin-nav__monogram" aria-hidden>
          BT
        </span>
        <div className="admin-nav__words">
          <strong>Bantex Trading</strong>
          <span>Admin</span>
        </div>
      </div>

      <nav className="admin-nav__links" aria-label="Admin">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav__link ${isActive(link.href, link.exact) ? "is-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="admin-nav__footer">
        <button
          type="button"
          className="admin-nav__logout"
          onClick={logout}
          disabled={busy}
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
