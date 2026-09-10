import type { Metadata } from "next";
import { orders } from "@/lib/orders";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orders/types";
import type { OrderStatus, PaymentStatus } from "@/lib/orders/types";
import OrdersList from "@/components/admin/OrdersList";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  const all = orders.list();

  const orderCounts = {} as Record<OrderStatus, number>;
  const paymentCounts = {} as Record<PaymentStatus, number>;
  for (const order of all) {
    orderCounts[order.orderStatus] = (orderCounts[order.orderStatus] ?? 0) + 1;
    paymentCounts[order.paymentStatus] = (paymentCounts[order.paymentStatus] ?? 0) + 1;
  }

  const unpaid = all.filter((o) => o.paymentStatus === "pending").length;
  const revenueMinor = all
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalMinor, 0);

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">Orders</h1>
          <p className="admin-pagehead__sub">
            Review and fulfil customer orders. New orders appear here once
            payment is confirmed by Stripe.
          </p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Total orders</p>
          <p className="admin-stat__value">{all.length}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Awaiting payment</p>
          <p className="admin-stat__value">{unpaid}</p>
          <p className="admin-stat__hint">Not yet confirmed by Stripe</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">New</p>
          <p className="admin-stat__value">{orderCounts.new ?? 0}</p>
          <p className="admin-stat__hint">Unprocessed</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Paid revenue</p>
          <p className="admin-stat__value">
            {formatLkr(revenueMinor)}
          </p>
        </div>
      </div>

      <OrdersList
        orders={all}
        orderCounts={orderCounts}
        paymentCounts={paymentCounts}
        orderStatusOptions={ORDER_STATUSES}
        paymentStatusOptions={PAYMENT_STATUSES}
      />
    </>
  );
}

function formatLkr(minor: number): string {
  const rupees = (minor / 100).toLocaleString("en-LK", { maximumFractionDigits: 0 });
  return `Rs. ${rupees}`;
}
