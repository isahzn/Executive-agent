// Public entry point for the order module. Re-exports the data model and the
// store implementation. Email delivery is intentionally NOT re-exported here so
// that importing the order store never pulls in the SMTP/nodemailer dependency —
// the webhook imports it directly from ./email.
export type {
  Order,
  OrderCustomer,
  OrderLine,
  OrderRepository,
  OrderStatus,
  PaymentStatus,
  EmailStatus,
} from "./types";
export { PAYMENT_STATUSES, ORDER_STATUSES } from "./types";
export { orders, createOrder, clearOrders } from "./store";
