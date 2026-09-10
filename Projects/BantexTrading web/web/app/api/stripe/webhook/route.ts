import { NextResponse } from "next/server";
import Stripe from "stripe";
import { orders } from "@/lib/orders";
import { sendOrderNotificationEmail, EmailNotConfiguredError } from "@/lib/orders/email";

export const runtime = "nodejs";

// Stripe webhook handler. Verifies the signature against the raw request body,
// then treats a successfully-paid Checkout Session as the authoritative trigger
// for a paid order. It is idempotent against duplicate delivery and — crucially —
// a failed owner email never changes the already-paid payment state.
export async function POST(request: Request): Promise<Response> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("stripe webhook signature error", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Only mark paid when Stripe has actually confirmed the payment. Some
    // delivery methods complete the session before funds settle.
    if (session.payment_status === "paid") {
      const result = orders.markPaidBySessionId(session.id, event.id);
      if (result && !result.alreadyPaid) {
        await sendOwnerNotification(result.order);
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = orders.getBySessionId(session.id);
    if (order && order.paymentStatus === "pending") {
      orders.updatePaymentStatus(order.id, "failed");
    }
  }

  return NextResponse.json({ received: true });
}

// Fire-and-forget owner notification. A delivery failure is recorded on the order
// (so it can be diagnosed/retried) and must NOT roll the order back to unpaid.
async function sendOwnerNotification(order: NonNullable<ReturnType<typeof orders.getById>>) {
  try {
    await sendOrderNotificationEmail(order);
    orders.setEmailStatus(order.id, "sent");
  } catch (error) {
    const message =
      error instanceof EmailNotConfiguredError ? error.message : "Email delivery failed.";
    console.error("email notification failed", error);
    orders.setEmailStatus(order.id, "failed", message);
  }
}
