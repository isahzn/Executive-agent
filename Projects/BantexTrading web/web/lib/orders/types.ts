// Order data model. A completed order is a permanent, self-contained snapshot of
// what the customer bought and what they paid at the time of purchase — it never
// references the live catalogue, so later product edits cannot alter history.
//
// Payment status and fulfilment (order) status are deliberately separate: a paid
// order is not automatically "completed", and vice-versa.

// Status of the payment side of an order. `paid` is set ONLY by a verified Stripe
// webhook — never by the browser or by visiting the success page.
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// How the customer chose to pay at checkout. `card` goes through a Stripe Checkout
// Session (payment confirmed by the webhook); `cod` is Cash on Delivery — the order
// is placed without a Stripe session and payment is settled on delivery (tracked by
// the fulfilment/order status, not by paymentStatus).
export type PaymentMethod = "card" | "cod";

// Status of the fulfilment side of an order. The owner advances this in /admin.
export type OrderStatus = "new" | "processing" | "completed" | "cancelled";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "processing",
  "completed",
  "cancelled",
];

// Delivery status of the owner email notification. Kept on the order so a failed
// send can be diagnosed and retried without touching the payment state.
export type EmailStatus = "none" | "sent" | "failed";

// A single product line at the moment of purchase. All display fields are copied
// from the live product at checkout time so later admin edits never rewrite the
// order. `unitPriceMinor` is the authoritative price actually charged (including
// any per-option price delta); never re-derived afterwards.
export interface OrderLine {
  productId: string;
  productName: string;
  options: { label: string; value: string }[];
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

// Customer details captured at checkout. Stored verbatim on the order.
export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  // Public order reference (e.g. "BT-LZ2KQ-7ABD9"). Unique and customer-facing.
  id: string;
  customer: OrderCustomer;
  lines: OrderLine[];
  totalMinor: number;
  currency: string; // "LKR"
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripeSessionId?: string;
  // Stripe PaymentIntent id (non-secret). Useful reference, never a credential.
  paymentIntentId?: string;
  // Stripe webhook event id that confirmed this order — used for idempotency so
  // a duplicate webhook delivery can never double-process or double-notify.
  paymentEventId?: string;
  emailStatus: EmailStatus;
  emailError?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  paidAt?: string;
}

// Storage abstraction. The current implementation is a file-backed store; a real
// datastore can be swapped in behind this same interface without changing the
// webhook, checkout, or admin code.
export interface OrderRepository {
  create(order: Order): Order;
  getById(id: string): Order | undefined;
  getBySessionId(sessionId: string): Order | undefined;
  attachSession(orderId: string, sessionId: string, paymentIntentId?: string): void;
  // All orders, newest-first.
  list(): Order[];
  // Idempotent against duplicate webhook delivery. Returns the order plus whether
  // it was ALREADY paid (so the caller can skip re-notifying). Returns undefined
  // when the Stripe session id is not attached to any known order.
  markPaidBySessionId(
    sessionId: string,
    eventId: string
  ): { order: Order; alreadyPaid: boolean } | undefined;
  // The only status the admin may change directly by hand.
  updateOrderStatus(id: string, orderStatus: OrderStatus): Order | undefined;
  setEmailStatus(id: string, emailStatus: EmailStatus, error?: string): void;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Order | undefined;
}
