import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Cancelled",
};

// A cancelled/failed payment. The cart is intentionally NOT cleared — the
// customer can return to it and retry. We never show a false success here.
export default function CancelledPage() {
  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Checkout</span>
          </div>
          <span className="eyebrow">Payment</span>
          <h1>Your payment was cancelled.</h1>
          <p>No charge was made. Your cart is still saved.</p>
        </div>
      </header>

      <section className="checkout">
        <div className="wrap">
          <div className="checkout-empty">
            <h2>Ready when you are.</h2>
            <p>
              You can return to your cart and try the payment again, or keep
              browsing. Nothing has been charged.
            </p>
            <div className="cart-empty-actions">
              <Link href="/cart" className="btn btn-primary">
                Return to Cart
              </Link>
              <Link href="/stationery" className="btn btn-ghost">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
