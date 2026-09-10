// Pure presentation helpers for order statuses. No server dependencies, so both
// server components and client components can import them.

import type { OrderStatus, PaymentMethod, PaymentStatus } from "./types";

export function paymentMethodLabel(method: PaymentMethod | undefined): string {
  return method === "cod" ? "Cash on Delivery" : "Card";
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Awaiting payment";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
  }
}

export function paymentStatusClass(status: PaymentStatus): string {
  return `admin-badge--payment-${status}`;
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

export function orderStatusClass(status: OrderStatus): string {
  return `admin-badge--order-${status}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" });
}
