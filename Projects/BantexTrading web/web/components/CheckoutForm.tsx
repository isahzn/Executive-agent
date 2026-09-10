"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, lineSubtotal } from "@/lib/cart";
import { formatPriceMinor } from "@/lib/money";
import type { CheckoutCustomer, CheckoutItemInput } from "@/lib/checkout-types";
import type { PaymentMethod } from "@/lib/orders/types";

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(customer: CheckoutCustomer): FieldErrors {
  const errors: FieldErrors = {};
  if (!customer.name.trim()) errors.name = "Please enter your full name.";
  if (!customer.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(customer.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!customer.phone.trim()) errors.phone = "Please enter your phone number.";
  if (!customer.address.trim())
    errors.address = "Please enter your delivery address.";
  return errors;
}

export default function CheckoutForm() {
  const { lines, count, total } = useCart();
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Nothing to check out.</h2>
        <p>Your cart is empty. Add some products before checking out.</p>
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

  const setField = (key: keyof CheckoutCustomer, value: string) => {
    setCustomer((c) => ({ ...c, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(customer);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const items: CheckoutItemInput[] = lines.map((line) => ({
      productId: line.productId,
      options: line.options,
      quantity: line.quantity,
    }));

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, paymentMethod }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError(
        "We couldn't reach the checkout. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="checkout-grid" onSubmit={handleSubmit} noValidate>
      <div className="checkout-form">
        <div className="checkout-section">
          <h2 className="checkout-section-title">Your details</h2>
          <div className="field">
            <label className="field-label" htmlFor="co-name">
              Full name
            </label>
            <input
              id="co-name"
              className="field-input"
              type="text"
              autoComplete="name"
              value={customer.name}
              onChange={(e) => setField("name", e.target.value)}
              aria-invalid={errors.name ? "true" : undefined}
            />
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="co-email">
              Email address
            </label>
            <input
              id="co-email"
              className="field-input"
              type="email"
              autoComplete="email"
              value={customer.email}
              onChange={(e) => setField("email", e.target.value)}
              aria-invalid={errors.email ? "true" : undefined}
            />
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="co-phone">
              Phone number
            </label>
            <input
              id="co-phone"
              className="field-input"
              type="tel"
              autoComplete="tel"
              value={customer.phone}
              onChange={(e) => setField("phone", e.target.value)}
              aria-invalid={errors.phone ? "true" : undefined}
            />
            {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="co-address">
              Delivery address
            </label>
            <textarea
              id="co-address"
              className="field-input"
              rows={3}
              autoComplete="street-address"
              value={customer.address}
              onChange={(e) => setField("address", e.target.value)}
              aria-invalid={errors.address ? "true" : undefined}
            />
            {errors.address ? (
              <p className="field-error">{errors.address}</p>
            ) : null}
          </div>
        </div>

        <div className="checkout-section">
          <h2 className="checkout-section-title">Payment method</h2>
          <div className="checkout-methods">
            <label
              className={`checkout-method ${
                paymentMethod === "card" ? "checkout-method--selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="checkout-method__input"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <span className="checkout-method__body">
                <span className="checkout-method__title">Card</span>
                <span className="checkout-method__desc">
                  Pay now online with your card. Processed securely by Stripe.
                </span>
              </span>
            </label>
            <label
              className={`checkout-method ${
                paymentMethod === "cod" ? "checkout-method--selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="checkout-method__input"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span className="checkout-method__body">
                <span className="checkout-method__title">Cash on Delivery</span>
                <span className="checkout-method__desc">
                  Pay the total in cash when your order is delivered.
                </span>
              </span>
            </label>
          </div>
          {paymentMethod === "cod" ? (
            <p className="checkout-method-note">
              We&apos;ll confirm your order and send you updates on WhatsApp.
            </p>
          ) : null}
        </div>
      </div>

      <div className="checkout-summary">
        <h2 className="checkout-section-title">Order summary</h2>
        <ul className="checkout-items">
          {lines.map((line) => (
            <li key={line.key} className="checkout-item">
              <div className="checkout-item-info">
                <span className="checkout-item-name">{line.name}</span>
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
                  {line.quantity} × {formatPriceMinor(line.unitPriceMinor)}
                </span>
              </div>
              <span className="checkout-item-total">
                {formatPriceMinor(lineSubtotal(line))}
              </span>
            </li>
          ))}
        </ul>

        <div className="checkout-summary-row">
          <span>
            {count} {count === 1 ? "item" : "items"}
          </span>
          <span>{formatPriceMinor(total)}</span>
        </div>
        <div className="checkout-summary-row checkout-summary-total">
          <span>Total</span>
          <span>{formatPriceMinor(total)}</span>
        </div>
        <p className="checkout-summary-note">
          {paymentMethod === "cod"
            ? "You'll pay the amount shown above in cash on delivery."
            : "Amounts are confirmed at payment. Secure checkout powered by Stripe."}
        </p>

        {submitError ? (
          <p className="checkout-submit-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting
            ? paymentMethod === "cod"
              ? "Placing order…"
              : "Preparing payment…"
            : paymentMethod === "cod"
              ? `Place order — ${formatPriceMinor(total)} on delivery`
              : `Pay ${formatPriceMinor(total)}`}
        </button>
        {paymentMethod === "cod" ? (
          <p className="checkout-security">
            No online payment now. Keep the cash ready for delivery.
          </p>
        ) : (
          <p className="checkout-security">
            Your payment details are handled securely by Stripe. We never store
            your card number.
          </p>
        )}
      </div>
    </form>
  );
}
