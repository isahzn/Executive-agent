import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// check. If STRIPE_SECRET_KEY is set in the environment, clear it for these tests
// so we can exercise the "not configured" and COD (no-Stripe) paths deterministically.
const ORIGINAL_SECRET = process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_SECRET_KEY;

// Point both the catalog and order stores at throwaway files before importing
// checkout (which transitively imports them), so real data is never touched.
const dir = mkdtempSync(path.join(tmpdir(), "bantex-checkout-"));
let checkout: typeof import("./checkout");
let orderStore: typeof import("./orders").orders;

beforeAll(async () => {
  process.env.CATALOG_DATA_FILE = path.join(dir, "catalog.json");
  process.env.ORDERS_DATA_FILE = path.join(dir, "orders.json");
  checkout = await import("./checkout");
  orderStore = (await import("./orders")).orders;
});

afterAll(() => {
  delete process.env.CATALOG_DATA_FILE;
  delete process.env.ORDERS_DATA_FILE;
  if (ORIGINAL_SECRET !== undefined) process.env.STRIPE_SECRET_KEY = ORIGINAL_SECRET;
  rmSync(dir, { recursive: true, force: true });
});

const validCustomer = {
  name: "Asha Perera",
  email: "asha@example.com",
  phone: "077 123 4567",
  address: "1 Main St, Colombo 12",
};

describe("checkout validation", () => {
  describe("validateCustomer", () => {
    it("accepts a fully valid customer", () => {
      expect(() =>
        checkout.validateCustomer({ ...validCustomer } as never)
      ).not.toThrow();
    });

    it("rejects missing or empty fields", () => {
      expect(() => checkout.validateCustomer({ ...validCustomer, name: "  " } as never)).toThrow(/name/i);
      expect(() => checkout.validateCustomer({ ...validCustomer, email: "" } as never)).toThrow(/email/i);
      expect(() => checkout.validateCustomer({ ...validCustomer, phone: "" } as never)).toThrow(/phone/i);
      expect(() => checkout.validateCustomer({ ...validCustomer, address: "" } as never)).toThrow(/address/i);
    });

    it("rejects a malformed email", () => {
      expect(() =>
        checkout.validateCustomer({ ...validCustomer, email: "not-an-email" } as never)
      ).toThrow(/email/i);
    });

    it("rejects over-long input", () => {
      expect(() =>
        checkout.validateCustomer({ ...validCustomer, name: "x".repeat(200) } as never)
      ).toThrow(/name/i);
      expect(() =>
        checkout.validateCustomer({ ...validCustomer, address: "x".repeat(2000) } as never)
      ).toThrow(/address/i);
    });
  });

  describe("validateCart", () => {
    it("rejects an empty cart", () => {
      expect(() => checkout.validateCart([])).toThrow(/empty/i);
    });

    it("rejects a non-array cart", () => {
      expect(() => checkout.validateCart(null as never)).toThrow(/empty/i);
    });

    it("rejects an unknown product", () => {
      expect(() =>
        checkout.validateCart([{ productId: "nope", options: [], quantity: 1 } as never])
      ).toThrow(/no longer available/i);
    });

    it("rejects an invalid quantity", () => {
      expect(() =>
        checkout.validateCart([{ productId: "pen", options: [], quantity: 0 } as never])
      ).toThrow(/quantity/i);
    });

    it("recomputes the authoritative price and totals", () => {
      const { lines, totalMinor } = checkout.validateCart([
        {
          productId: "pen",
          options: [
            { label: "Ink Colour", value: "Blue" },
            { label: "Pack", value: "Pack of 10" },
          ],
          quantity: 1,
        },
      ]);
      // Base 6000 + pack delta 54000 -> 60000 (Ink Colour has no delta)
      expect(lines[0].unitAmountMinor).toBe(60000);
      expect(totalMinor).toBe(60000);
    });

    it("rejects a missing required option group", () => {
      expect(() =>
        checkout.validateCart([
          { productId: "pen", options: [{ label: "Ink Colour", value: "Blue" }], quantity: 1 },
        ])
      ).toThrow(/select Pack/i);
    });
  });

  describe("validatePaymentMethod", () => {
    it("defaults to card and accepts card/cod", () => {
      expect(checkout.validatePaymentMethod(undefined)).toBe("card");
      expect(checkout.validatePaymentMethod("card")).toBe("card");
      expect(checkout.validatePaymentMethod("cod")).toBe("cod");
    });

    it("rejects an unknown payment method", () => {
      expect(() => checkout.validatePaymentMethod("bitcoin")).toThrow(/payment method/i);
      expect(() => checkout.validatePaymentMethod(42)).toThrow(/payment method/i);
    });
  });

  describe("createCheckoutSession", () => {
    const items = [
      {
        productId: "pen",
        options: [
          { label: "Ink Colour", value: "Blue" },
          { label: "Pack", value: "Pack of 10" },
        ],
        quantity: 1,
      },
    ];

    it("creates a COD order and redirects to the confirm page without Stripe", async () => {
      const result = await checkout.createCheckoutSession(
        { customer: { ...validCustomer }, items, paymentMethod: "cod" },
        "http://localhost:3000"
      );
      expect(result.ok).toBe(true);
      expect(result.url).toMatch(/\/checkout\/confirm\?orderId=BT-\d{6}$/);
      expect(result.orderId).toMatch(/^BT-\d{6}$/);
      const order = orderStore.getById(result.orderId!);
      expect(order?.paymentMethod).toBe("cod");
      expect(order?.stripeSessionId).toBeUndefined();
      expect(order?.paymentStatus).toBe("pending");
    });

    it("throws CheckoutNotConfiguredError for a card order when Stripe is absent", async () => {
      await expect(
        checkout.createCheckoutSession(
          { customer: { ...validCustomer }, items, paymentMethod: "card" },
          "http://localhost:3000"
        )
      ).rejects.toThrow(checkout.CheckoutNotConfiguredError);
    });

    it("rejects an invalid payment method", async () => {
      await expect(
        checkout.createCheckoutSession(
          { customer: { ...validCustomer }, items, paymentMethod: "bitcoin" as never },
          "http://localhost:3000"
        )
      ).rejects.toThrow(/payment method/i);
    });
  });
});
