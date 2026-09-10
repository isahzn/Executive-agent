import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orders } from "@/lib/orders";
import { formatPriceMinor } from "@/lib/money";
import {
  formatDateTime,
  orderStatusClass,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusClass,
  paymentStatusLabel,
} from "@/lib/orders/present";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = orders.getById(id);

  if (!order) notFound();

  const lineSubtotal = order.lines.reduce((s, l) => s + l.lineTotalMinor, 0);

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <Link href="/admin/orders" className="admin-back">
            ← Back to orders
          </Link>
          <h1 className="admin-pagehead__title">Order {order.id}</h1>
          <p className="admin-pagehead__sub">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="admin-pagehead__actions">
          <span className={`admin-badge ${paymentStatusClass(order.paymentStatus)}`}>
            {paymentStatusLabel(order.paymentStatus)}
          </span>
          <span className={`admin-badge ${orderStatusClass(order.orderStatus)}`}>
            {orderStatusLabel(order.orderStatus)}
          </span>
        </div>
      </div>

      <div className="admin-order-grid">
        <section className="admin-card">
          <h2 className="admin-card__title">Customer</h2>
          <dl className="admin-order-meta">
            <div>
              <dt>Name</dt>
              <dd>{order.customer.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`}>
                  {order.customer.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt>Delivery address</dt>
              <dd className="admin-order-address">{order.customer.address}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Order</h2>
          <dl className="admin-order-meta">
            <div>
              <dt>Order reference</dt>
              <dd>{order.id}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>{order.currency}</dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>{paymentMethodLabel(order.paymentMethod)}</dd>
            </div>
            <div>
              <dt>Stripe session</dt>
              <dd className="admin-order-mono">{order.stripeSessionId ?? "—"}</dd>
            </div>
            {order.paymentIntentId ? (
              <div>
                <dt>Payment intent</dt>
                <dd className="admin-order-mono">{order.paymentIntentId}</dd>
              </div>
            ) : null}
            <div>
              <dt>Email notification</dt>
              <dd>
                {order.emailStatus === "sent"
                  ? "Sent to owner"
                  : order.emailStatus === "failed"
                    ? `Failed${order.emailError ? ` — ${order.emailError}` : ""}`
                    : "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Purchased products</h2>
          <span className="admin-footnote" style={{ marginTop: 0 }}>
            Snapshot — prices as charged at purchase
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Options</th>
              <th>Qty</th>
              <th>Unit</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line, i) => (
              <tr key={`${line.productId}-${i}`}>
                <td>
                  <span className="admin-table__name">{line.productName}</span>
                </td>
                <td>
                  {line.options.length > 0 ? (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>
                      {line.options.map((o) => `${o.label}: ${o.value}`).join(", ")}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.82rem", color: "var(--slate)" }}>—</span>
                  )}
                </td>
                <td>{line.quantity}</td>
                <td>{formatPriceMinor(line.unitPriceMinor)}</td>
                <td style={{ textAlign: "right" }}>
                  {formatPriceMinor(line.lineTotalMinor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-order-totals">
          <div className="admin-order-total-row">
            <span>Subtotal ({order.lines.length}{order.lines.length === 1 ? " item" : " items"})</span>
            <span>{formatPriceMinor(lineSubtotal)}</span>
          </div>
          <div className="admin-order-total-row admin-order-total-row--grand">
            <span>Total</span>
            <span>{formatPriceMinor(order.totalMinor)}</span>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-card__title">Fulfilment status</h2>
        <OrderStatusSelect order={order} />
      </section>
    </>
  );
}
