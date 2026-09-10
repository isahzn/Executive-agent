"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPriceMinor } from "@/lib/money";
import CartItemRow from "./CartItemRow";

export default function CartView() {
  const { lines, count, total } = useCart();

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty.</h2>
        <p>Browse our stationery and electrical ranges to find everyday essentials.</p>
        <div className="cart-empty-actions">
          <Link href="/stationery" className="btn btn-primary">
            Shop Stationery
          </Link>
          <Link href="/electrical" className="btn btn-ghost">
            Shop Electrical Goods
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ul className="cart-list">
        {lines.map((line) => (
          <CartItemRow key={line.key} line={line} />
        ))}
      </ul>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>
            {count} {count === 1 ? "item" : "items"}
          </span>
          <span>{formatPriceMinor(total)}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>Subtotal</span>
          <span>{formatPriceMinor(total)}</span>
        </div>
        <p className="cart-summary-note">
          Taxes and delivery are confirmed at checkout.
        </p>
        <div className="cart-summary-actions">
          <Link href="/stationery" className="btn btn-ghost">
            Continue Shopping
          </Link>
          <Link href="/checkout" className="btn btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
