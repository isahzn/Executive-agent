import type { Metadata } from "next";
import Link from "next/link";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your Bantex Trading cart.",
};

export default function CartPage() {
  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Your Cart</span>
          </div>
          <span className="eyebrow">Cart</span>
          <h1>Your cart</h1>
          <p>Review what you have ready to order.</p>
        </div>
      </header>

      <section className="cart">
        <div className="wrap">
          <CartView />
        </div>
      </section>
    </main>
  );
}
