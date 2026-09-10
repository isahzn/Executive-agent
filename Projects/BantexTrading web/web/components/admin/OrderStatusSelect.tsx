"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { orderStatusClass, orderStatusLabel } from "@/lib/orders/present";

export default function OrderStatusSelect({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function save(next: OrderStatus) {
    if (busy) return;
    if (next === order.orderStatus) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(order.orderStatus);
        setNotice(data.error ?? "Could not update the order.");
      } else {
        router.refresh();
      }
    } catch {
      setStatus(order.orderStatus);
      setNotice("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-order-status">
      <div className="admin-order-status__row">
        <label htmlFor="order-status-select" className="admin-form__label">
          Fulfilment status
        </label>
        <select
          id="order-status-select"
          className="admin-form__select"
          value={status}
          disabled={busy}
          onChange={(e) => {
            const next = e.target.value as OrderStatus;
            setStatus(next);
            save(next);
          }}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <p className="admin-order-status__hint">
        <span className={`admin-badge ${orderStatusClass(status)}`}>
          {orderStatusLabel(status)}
        </span>
        <span style={{ marginLeft: "0.5rem" }}>
          Changing the fulfilment status does not alter the recorded payment.
        </span>
      </p>

      {notice && <div className="admin-notice admin-notice--error">{notice}</div>}
    </div>
  );
}
