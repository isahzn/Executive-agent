import type { Metadata } from "next";
import Link from "next/link";
import { orders } from "@/lib/orders";
import { formatPriceMinor } from "@/lib/money";
import ClearCartOnConfirm from "@/components/ClearCartOnConfirm";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

// The COD confirmation corresponds to a server-side order that was placed as
// Cash on Delivery. We never trust a bare navigation to mean "an order exists" —
// the order must be found and must be a COD order. Unlike card, there is no
// Stripe session to verify, so the honest check is "this is a real COD order".
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId ? orders.getById(orderId) : undefined;
  const confirmed = Boolean(order && order.paymentMethod === "cod");

  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Order Confirmation</span>
          </div>
          <span className="eyebrow">
            {confirmed ? "Order confirmed" : "Order status"}
          </span>
          <h1>{confirmed ? "Thank you for your order." : "Order not found"}</h1>
        </div>
      </header>

      <section className="checkout">
        <div className="wrap">
          {confirmed && order ? (
            <div className="success-card">
              {/* Only here does the server confirm a real COD order, so it's safe
                  to clear the cart — never on a bare navigation to the URL. */}
              <ClearCartOnConfirm />
              <p className="success-order-id">Order reference: {order.id}</p>
              <p className="success-note">
                Pay <strong>{formatPriceMinor(order.totalMinor)}</strong> in cash
                when your order arrives.
              </p>

              <ul className="checkout-items">
                {order.lines.map((line, i) => (
                  <li key={`${line.productId}-${i}`} className="checkout-item">
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">
                        {line.productName}
                      </span>
                      {line.options.length > 0 ? (
                        <span className="checkout-item-options">
                          {line.options.map((o) => (
                            <span key={o.label}>
                              {o.label}: {o.value}
                            </span>
                          ))}
                        </span>
                      ) : null}
                      <span className="checkout-item-qty">
                        {line.quantity} ×{" "}
                        {formatPriceMinor(line.unitPriceMinor)}
                      </span>
                    </div>
                    <span className="checkout-item-total">
                      {formatPriceMinor(line.lineTotalMinor)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total (due on delivery)</span>
                <span>{formatPriceMinor(order.totalMinor)}</span>
              </div>

              <p className="success-note">
                We&apos;ll send you order updates on WhatsApp at{" "}
                {order.customer.phone} and call to confirm delivery.
              </p>

              <div className="cart-empty-actions">
                <Link href="/stationery" className="btn btn-primary">
                  Continue Shopping
                </Link>
                <Link href="/" className="btn btn-ghost">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="checkout-empty">
              <h2>We couldn&apos;t find that order.</h2>
              <p>
                If you think this is a mistake, please contact us or return to
                your cart to place your order again.
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
          )}
        </div>
      </section>
    </main>
  );
}
