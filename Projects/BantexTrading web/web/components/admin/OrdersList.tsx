"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPriceMinor } from "@/lib/money";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/orders/types";
import {
  formatDateTime,
  orderStatusClass,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusClass,
  paymentStatusLabel,
} from "@/lib/orders/present";

interface Props {
  orders: Order[];
  orderCounts: Record<OrderStatus, number>;
  paymentCounts: Record<PaymentStatus, number>;
  orderStatusOptions: OrderStatus[];
  paymentStatusOptions: PaymentStatus[];
}

export default function OrdersList({
  orders,
  orderCounts,
  paymentCounts,
  orderStatusOptions,
  paymentStatusOptions,
}: Props) {
  const [q, setQ] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderFilter !== "all" && o.orderStatus !== orderFilter) return false;
      if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
      if (!query) return true;
      return (
        o.id.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.email.toLowerCase().includes(query) ||
        o.customer.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""))
      );
    });
  }, [q, orderFilter, paymentFilter, orders]);

  return (
    <>
      <div className="admin-orders__filters">
        <input
          className="admin-form__input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order, name, email, phone…"
          aria-label="Search orders"
          style={{ minWidth: 260 }}
        />

        <label className="admin-orders__filter">
          <span className="admin-orders__filter-label">Order status</span>
          <select
            className="admin-form__select"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value as OrderStatus | "all")}
          >
            <option value="all">All ({orders.length})</option>
            {orderStatusOptions.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)} ({orderCounts[s] ?? 0})
              </option>
            ))}
          </select>
        </label>

        <label className="admin-orders__filter">
          <span className="admin-orders__filter-label">Payment</span>
          <select
            className="admin-form__select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "all")}
          >
            <option value="all">All</option>
            {paymentStatusOptions.map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabel(s)} ({paymentCounts[s] ?? 0})
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__title">No orders found</p>
          <p className="admin-empty__text">
            {orders.length === 0
              ? "Orders appear here once a customer completes checkout and payment is confirmed."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Method</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Open</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="admin-table__name">{o.id}</span>
                  </td>
                  <td>{formatDateTime(o.createdAt)}</td>
                  <td>
                    <div>{o.customer.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                      {o.customer.email}
                    </div>
                  </td>
                  <td>{formatPriceMinor(o.totalMinor)}</td>
                  <td>{paymentMethodLabel(o.paymentMethod)}</td>
                  <td>
                    <span className={`admin-badge ${paymentStatusClass(o.paymentStatus)}`}>
                      {paymentStatusLabel(o.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${orderStatusClass(o.orderStatus)}`}>
                      {orderStatusLabel(o.orderStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__row-actions">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="admin-btn admin-btn--ghost"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
