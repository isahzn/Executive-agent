import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { orders } from "@/lib/orders";
import { formatPriceMinor } from "@/lib/money";
import ClearCartOnConfirm from "@/components/ClearCartOnConfirm";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

// The success state MUST correspond to a server-verified paid payment. We never
// trust a client-side navigation to mean "paid", and we never clear the cart from
// a bare visit to this URL without a confirmed payment.
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; orderId?: string }>;
}) {
  const { session_id } = await searchParams;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  let paid = false;
  let order: ReturnType<typeof orders.getById>;
  let sessionEmail: string | undefined;

  if (session_id && secretKey) {
    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
      sessionEmail = session.customer_email ?? undefined;
      if (paid) order = orders.getBySessionId(session_id);
    } catch {
      paid = false;
    }
  }

  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Order Confirmation</span>
          </div>
          <span className="eyebrow">
            {paid ? "Order confirmed" : "Order status"}
          </span>
          <h1>{paid ? "Thank you for your order." : "Order received"}</h1>
        </div>
      </header>

      <section className="checkout">
        <div className="wrap">
          {paid ? (
            <div className="success-card">
              {/* Only render the cart-clear when the server actually verified a
                  paid payment — never on the cancelled/failure paths. */}
              <ClearCartOnConfirm />
              {order ? (
                <>
                  <p className="success-order-id">Order reference: {order.id}</p>
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
                    <span>Total paid</span>
                    <span>{formatPriceMinor(order.totalMinor)}</span>
                  </div>
                </>
              ) : null}

              <p className="success-note">
                We&apos;ll be in touch shortly at{" "}
                {sessionEmail ?? order?.customer.email ?? "your email"} to arrange
                delivery.
              </p>
              {order ? (
                <p className="success-note">
                  We&apos;ll also send you order updates on WhatsApp at{" "}
                  {order.customer.phone}.
                </p>
              ) : null}

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
              <h2>We couldn&apos;t confirm this payment.</h2>
              <p>
                Your payment could not be verified automatically right now. If
                you were charged, we&apos;ll contact you at your email to arrange
                delivery; otherwise you can return to your cart and try again.
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
