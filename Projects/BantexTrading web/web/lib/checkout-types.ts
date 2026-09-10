// Types shared between the client (CheckoutForm) and the server (API route).
// This module has NO server dependencies, so it is safe to import from either side.

import type { PaymentMethod } from "./orders/types";

export interface CheckoutLineOption {
  label: string;
  value: string;
}

// The client only sends what identifies a chosen line. The server recomputes the
// authoritative price from lib/products.ts — the browser never supplies amounts.
export interface CheckoutItemInput {
  productId: string;
  options: CheckoutLineOption[];
  quantity: number;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CheckoutRequest {
  customer: CheckoutCustomer;
  items: CheckoutItemInput[];
  // Which payment method the customer chose. Optional so old callers/tests
  // default to card. The server validates it and never trusts the client's price.
  paymentMethod?: PaymentMethod;
}

export interface CheckoutResponse {
  ok: boolean;
  url?: string;
  orderId?: string;
  error?: string;
}
