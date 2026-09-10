// Server-side checkout logic. Never imports this into a client component —
// it loads the Stripe SDK and reads the secret key.
import Stripe from "stripe";
import { CURRENCY } from "./money";
import { priceForVariant } from "./catalog/types";
import { productById, type Product } from "./products";
import { createOrder, orders } from "./orders";
import type { PaymentMethod } from "./orders/types";
import { sendOrderNotificationEmail } from "./orders/email";
import type {
  CheckoutItemInput,
  CheckoutRequest,
  CheckoutResponse,
} from "./checkout-types";

// Thrown when the Stripe secret key is missing. The UI treats this as a
// friendly "online payment isn't configured yet" rather than a crash.
export class CheckoutNotConfiguredError extends Error {}

// Thrown for any client-supplied cart/customer data that fails validation.
export class CheckoutValidationError extends Error {}

export interface ValidatedLine {
  product: Product;
  options: CheckoutItemInput["options"];
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
}

const MAX_QUANTITY = 999;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYMENT_METHODS: PaymentMethod[] = ["card", "cod"];

export function validatePaymentMethod(value: unknown): PaymentMethod {
  if (value === undefined || value === null) return "card";
  if (typeof value !== "string" || !PAYMENT_METHODS.includes(value as PaymentMethod)) {
    throw new CheckoutValidationError("Please choose a payment method.");
  }
  return value as PaymentMethod;
}

// Server-side customer validation. The form validates for UX, but the server
// must not trust client-supplied strings — it bounds lengths and rejects missing
// or malformed fields before anything is persisted or sent to Stripe.
export function validateCustomer(customer: CheckoutRequest["customer"]): void {
  if (!customer || typeof customer !== "object") {
    throw new CheckoutValidationError("Please enter your details.");
  }
  const name = String(customer.name ?? "").trim();
  const email = String(customer.email ?? "").trim();
  const phone = String(customer.phone ?? "").trim();
  const address = String(customer.address ?? "").trim();

  if (!name || name.length > 160) {
    throw new CheckoutValidationError("Please enter your full name.");
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    throw new CheckoutValidationError("Please enter a valid email address.");
  }
  if (!phone || phone.length > 40) {
    throw new CheckoutValidationError("Please enter your phone number.");
  }
  if (!address || address.length > 1000) {
    throw new CheckoutValidationError("Please enter your delivery address.");
  }
}

export function validateCart(
  items: CheckoutItemInput[]
): { lines: ValidatedLine[]; totalMinor: number } {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutValidationError("Your cart is empty.");
  }

  const lines = items.map((item): ValidatedLine => {
    const product = productById(item.productId);
    if (!product) {
      throw new CheckoutValidationError(
        "A product in your cart is no longer available."
      );
    }
    if (!product.available) {
      throw new CheckoutValidationError(
        `${product.name} is no longer available. Please remove it from your cart.`
      );
    }

    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new CheckoutValidationError("A quantity in your cart is invalid.");
    }

    const definitions = product.options ?? [];
    const byLabel = new Map(definitions.map((d) => [d.label, d]));

    if (!Array.isArray(item.options)) {
      throw new CheckoutValidationError(
        `Please select the options for ${product.name}.`
      );
    }

    const selectedLabels = new Set<string>();
    for (const opt of item.options) {
      const def = byLabel.get(opt.label);
      if (!def || !def.values.some((v) => v.value === opt.value)) {
        throw new CheckoutValidationError(
          `The selected options for ${product.name} are invalid.`
        );
      }
      if (selectedLabels.has(opt.label)) {
        throw new CheckoutValidationError(
          `Duplicate option for ${product.name}.`
        );
      }
      selectedLabels.add(opt.label);
    }

    // Every required option group must be chosen.
    for (const def of definitions) {
      if (!selectedLabels.has(def.label)) {
        throw new CheckoutValidationError(`Please select ${def.label}.`);
      }
    }

    // Authoritative price includes any variant price delta, recomputed from the
    // product's option definitions — never trusted from the browser.
    const unitAmountMinor = priceForVariant(product, item.options);
    return {
      product,
      options: item.options,
      quantity,
      unitAmountMinor,
      lineTotalMinor: unitAmountMinor * quantity,
    };
  });

  const totalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
  return { lines, totalMinor };
}

function productDescription(line: ValidatedLine): string {
  return line.options.map((o) => `${o.label}: ${o.value}`).join(", ");
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new CheckoutNotConfiguredError(
      "Stripe is not configured for this store yet."
    );
  }
  return new Stripe(secretKey);
}

export async function createCheckoutSession(
  request: CheckoutRequest,
  origin: string
): Promise<CheckoutResponse> {
  validateCustomer(request.customer);
  const paymentMethod = validatePaymentMethod(request.paymentMethod);
  const { lines, totalMinor } = validateCart(request.items);

  const order = createOrder(
    request.customer,
    lines.map((l) => ({
      productId: l.product.id,
      productName: l.product.name,
      options: l.options,
      quantity: l.quantity,
      unitPriceMinor: l.unitAmountMinor,
      lineTotalMinor: l.lineTotalMinor,
    })),
    totalMinor,
    paymentMethod
  );

  // Cash on Delivery: no Stripe session. Place the order directly, notify the
  // owner, and send the customer to a confirmation page. Email failure is purely
  // observational — the order stays placed.
  if (paymentMethod === "cod") {
    try {
      await sendOrderNotificationEmail(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      orders.setEmailStatus(order.id, "failed", message);
    }
    return {
      ok: true,
      url: `${origin}/checkout/confirm?orderId=${order.id}`,
      orderId: order.id,
    };
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: CURRENCY.toLowerCase(),
        unit_amount: l.unitAmountMinor,
        product_data: {
          name: l.product.name,
          description: productDescription(l),
        },
      },
    })),
    customer_email: request.customer.email,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancelled?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { orderId: order.id },
  });

  if (!session.url) {
    throw new CheckoutValidationError("Could not start the payment session.");
  }

  orders.attachSession(order.id, session.id);

  return { ok: true, url: session.url, orderId: order.id };
}
