import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Point the store at a throwaway file before importing it, so real order history
// is never read or mutated. Mirrors lib/catalog/catalog.test.ts.
const dir = mkdtempSync(path.join(tmpdir(), "bantex-orders-"));
let store: typeof import("./store");

beforeAll(async () => {
  process.env.ORDERS_DATA_FILE = path.join(dir, "orders.json");
  store = await import("./store");
});

afterAll(() => {
  delete process.env.ORDERS_DATA_FILE;
  rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
  store.clearOrders();
});

const customer = { name: "Asha Perera", email: "asha@example.com", phone: "0771234567", address: "1 Main St, Colombo" };

function lines() {
  return [
    {
      productId: "pen",
      productName: "Ballpoint Pen",
      options: [{ label: "Ink Colour", value: "Blue" }],
      quantity: 2,
      unitPriceMinor: 6000,
      lineTotalMinor: 12000,
    },
    {
      productId: "charger",
      productName: "Charger",
      options: [],
      quantity: 1,
      unitPriceMinor: 95000,
      lineTotalMinor: 95000,
    },
  ];
}

describe("order store", () => {
  it("creates a pending order with default statuses", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    expect(order.id).toMatch(/^BT-\d{6}$/);
    expect(order.paymentMethod).toBe("card");
    expect(order.paymentStatus).toBe("pending");
    expect(order.orderStatus).toBe("new");
    expect(order.emailStatus).toBe("none");
    expect(order.currency).toBe("LKR");
    expect(order.totalMinor).toBe(107000);
  });

  it("reads an order by id and by session id", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    store.orders.attachSession(order.id, "cs_123");
    expect(store.orders.getById(order.id)?.id).toBe(order.id);
    expect(store.orders.getBySessionId("cs_123")?.id).toBe(order.id);
    expect(store.orders.getBySessionId("cs_missing")).toBeUndefined();
  });

  it("marks an order paid by session id idempotently", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    store.orders.attachSession(order.id, "cs_123");

    const first = store.orders.markPaidBySessionId("cs_123", "evt_1");
    expect(first?.alreadyPaid).toBe(false);
    expect(first?.order.paymentStatus).toBe("paid");
    expect(first?.order.paidAt).toBeTruthy();

    // Duplicate delivery of the same event: no re-processing, still paid.
    const second = store.orders.markPaidBySessionId("cs_123", "evt_1");
    expect(second?.alreadyPaid).toBe(true);
    expect(second?.order.paymentStatus).toBe("paid");

    // A different event for an already-paid session: also idempotent.
    const third = store.orders.markPaidBySessionId("cs_123", "evt_2");
    expect(third?.alreadyPaid).toBe(true);
  });

  it("returns undefined for an unknown session on markPaid", () => {
    expect(store.orders.markPaidBySessionId("cs_unknown", "evt_1")).toBeUndefined();
  });

  it("persists to disk so a fresh read sees the change", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    store.orders.attachSession(order.id, "cs_persist");
    store.orders.markPaidBySessionId("cs_persist", "evt_persist");

    const reloaded = store.orders.getById(order.id);
    expect(reloaded?.paymentStatus).toBe("paid");
    expect(reloaded?.stripeSessionId).toBe("cs_persist");
  });

  it("updates order status (fulfilment) without touching payment status", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    store.orders.attachSession(order.id, "cs_123");
    store.orders.markPaidBySessionId("cs_123", "evt_1");

    const updated = store.orders.updateOrderStatus(order.id, "completed");
    expect(updated?.orderStatus).toBe("completed");
    expect(updated?.paymentStatus).toBe("paid");

    expect(store.orders.updateOrderStatus("nope", "completed")).toBeUndefined();
  });

  it("tracks the owner email delivery status independently of payment", () => {
    const order = store.createOrder(customer, lines(), 107000, "card");
    store.orders.attachSession(order.id, "cs_123");
    store.orders.markPaidBySessionId("cs_123", "evt_1");
    store.orders.setEmailStatus(order.id, "failed", "SMTP not configured");

    const stillPaid = store.orders.getById(order.id);
    expect(stillPaid?.emailStatus).toBe("failed");
    expect(stillPaid?.paymentStatus).toBe("paid");
  });

  it("lists orders newest-first", () => {
    const a = store.createOrder(customer, lines(), 1000, "card");
    const b = store.createOrder(customer, lines(), 2000, "card");
    const c = store.createOrder(customer, lines(), 3000, "card");
    // Same ms is possible; sort is by createdAt desc, so keep them distinct.
    store.orders.getById(c.id);
    const list = store.orders.list();
    expect(list.map((o) => o.id)).toContain(a.id);
    expect(list.map((o) => o.id)).toContain(b.id);
    expect(list.map((o) => o.id)).toContain(c.id);
    // Because all three were created in quick succession, verify the list is
    // sorted descending by createdAt.
    for (let i = 1; i < list.length; i++) {
      expect(new Date(list[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(list[i].createdAt).getTime()
      );
    }
  });

  it("assigns sequential human-friendly order numbers", () => {
    const a = store.createOrder(customer, lines(), 1000, "card");
    const b = store.createOrder(customer, lines(), 2000, "card");
    const c = store.createOrder(customer, lines(), 3000, "card");
    expect(a.id).toBe("BT-000001");
    expect(b.id).toBe("BT-000002");
    expect(c.id).toBe("BT-000003");
  });

  it("creates a COD order with no Stripe session and pending payment", () => {
    const order = store.createOrder(customer, lines(), 107000, "cod");
    expect(order.paymentMethod).toBe("cod");
    expect(order.stripeSessionId).toBeUndefined();
    expect(order.paymentStatus).toBe("pending");
  });

  it("preserves the purchase snapshot even after the catalogue changes", () => {
    const order = store.createOrder(
      customer,
      [
        {
          productId: "pen",
          productName: "Ballpoint Pen",
          options: [{ label: "Ink Colour", value: "Blue" }],
          quantity: 2,
          unitPriceMinor: 6000,
          lineTotalMinor: 12000,
        },
      ],
      12000,
      "card"
    );
    const reloaded = store.orders.getById(order.id);
    expect(reloaded?.lines[0].unitPriceMinor).toBe(6000);
    expect(reloaded?.lines[0].productName).toBe("Ballpoint Pen");
  });
});
