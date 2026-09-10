"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { navItems } from "@/lib/site";

function CartIcon({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="cart-btn"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      data-testid="cart-button"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 ? <span className="cart-badge">{count}</span> : null}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="Bantex Trading — home">
          <Image
            src="/logo.jpeg"
            alt="Bantex Trading monogram"
            width={34}
            height={34}
            className="logo-img"
            priority
          />
          <span className="logo-text">
            Bantex Trading
            <small>Pvt Ltd</small>
          </span>
        </Link>

        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? "active" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-cta">
          <Link href="/contact" className="btn btn-ghost btn-sm">
            Contact Us
          </Link>
          <Link href="/stationery" className="btn btn-primary btn-sm">
            Shop Now
          </Link>
          <CartIcon count={count} />
          <button
            type="button"
            className={`menu-toggle${open ? " open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-drawer${open ? " open" : ""}`}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={close}>
            {item.label}
          </Link>
        ))}
        <Link href="/contact" className="btn btn-primary btn-block" onClick={close}>
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
