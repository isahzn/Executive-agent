import type { Metadata } from "next";
import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Bantex Trading order.",
};

export default function CheckoutPage() {
  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/cart">Cart</Link> /{" "}
            <span>Checkout</span>
          </div>
          <span className="eyebrow">Checkout</span>
          <h1>Checkout</h1>
          <p>Enter your details to complete your order.</p>
        </div>
      </header>

      <section className="checkout">
        <div className="wrap">
          <CheckoutForm />
        </div>
      </section>
    </main>
  );
}
