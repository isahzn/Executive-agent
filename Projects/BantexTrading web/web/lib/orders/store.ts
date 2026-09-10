// File-backed order store. Orders persist to a JSON file (data/orders.json,
// gitignored) so they survive a server restart, and are read/written through a
// small synchronous API — the same pattern as the catalog store, so a real
// database can be swapped in later without touching callers.
//
// This is the authoritative home of order + payment state. Nothing in the store
// reads the live catalogue: orders are immutable snapshots.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CURRENCY } from "../money";
import type {
  Order,
  OrderCustomer,
  OrderLine,
  OrderRepository,
  PaymentMethod,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
// Tests (or deployments) can point the store at a different file so they never
// touch the real order history. Falls back to data/orders.json.
const DATA_FILE =
  process.env.ORDERS_DATA_FILE ?? path.join(DATA_DIR, "orders.json");

function load(): Order[] {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt/missing file — start fresh.
  }
  return [];
}

function persist(orders: Order[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
}

// Human-friendly sequential order reference, e.g. `BT-000001`, `BT-000002`.
// Derived from the largest existing numeric suffix so it is stable even if some
// orders were deleted, and skipping older `BT-LZ2KQ-7ABD9`-style ids (no trailing
// digits) without colliding.
function makeOrderId(): string {
  let max = 0;
  for (const o of load()) {
    const match = /(\d{6,})$/.exec(o.id);
    const n = match ? parseInt(match[1], 10) : 0;
    if (n > max) max = n;
  }
  return `BT-${String(max + 1).padStart(6, "0")}`;
}

// Build a fresh pending order from validated checkout data. `lines` already carry
// the authoritative prices captured at checkout — the store does not re-pricethem.
// `paymentMethod` chooses the payment path: `card` preps a Stripe session (attached
// later); `cod` needs no Stripe session at all.
export function createOrder(
  customer: OrderCustomer,
  lines: OrderLine[],
  totalMinor: number,
  paymentMethod: PaymentMethod = "card"
): Order {
  const now = new Date().toISOString();
  const order: Order = {
    id: makeOrderId(),
    customer,
    lines,
    totalMinor,
    currency: CURRENCY,
    paymentMethod,
    paymentStatus: "pending",
    orderStatus: "new",
    emailStatus: "none",
    createdAt: now,
    updatedAt: now,
  };
  return orders.create(order);
}

export const orders: OrderRepository = {
  create(order) {
    const all = load();
    all.push(order);
    persist(all);
    return order;
  },

  getById(id) {
    return load().find((o) => o.id === id);
  },

  getBySessionId(sessionId) {
    return load().find((o) => o.stripeSessionId === sessionId);
  },

  attachSession(orderId, sessionId, paymentIntentId) {
    const all = load();
    const order = all.find((o) => o.id === orderId);
    if (!order) return;
    order.stripeSessionId = sessionId;
    if (paymentIntentId) order.paymentIntentId = paymentIntentId;
    order.updatedAt = new Date().toISOString();
    persist(all);
  },

  list() {
    return load().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  markPaidBySessionId(sessionId, eventId) {
    const all = load();
    const order = all.find((o) => o.stripeSessionId === sessionId);
    if (!order) return undefined;
    // Already paid (regardless of the exact event id) — idempotent: no double
    // processing, no duplicate notification.
    if (order.paymentStatus === "paid") {
      return { order, alreadyPaid: true };
    }
    const now = new Date().toISOString();
    order.paymentStatus = "paid";
    order.paymentEventId = eventId;
    order.paidAt = now;
    order.updatedAt = now;
    persist(all);
    return { order, alreadyPaid: false };
  },

  updateOrderStatus(id, orderStatus) {
    const all = load();
    const order = all.find((o) => o.id === id);
    if (!order) return undefined;
    order.orderStatus = orderStatus;
    order.updatedAt = new Date().toISOString();
    persist(all);
    return order;
  },

  setEmailStatus(id, emailStatus, error) {
    const all = load();
    const order = all.find((o) => o.id === id);
    if (!order) return;
    order.emailStatus = emailStatus;
    order.emailError = error;
    order.updatedAt = new Date().toISOString();
    persist(all);
  },

  updatePaymentStatus(id, paymentStatus) {
    const all = load();
    const order = all.find((o) => o.id === id);
    if (!order) return undefined;
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    persist(all);
    return order;
  },
};

// Allow tests / tooling to clear the store between runs.
export function clearOrders(): void {
  persist([]);
}
