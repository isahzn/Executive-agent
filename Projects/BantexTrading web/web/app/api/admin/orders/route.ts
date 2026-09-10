import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { orders } from "@/lib/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/orders/types";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const all = orders.list();
  const orderStatusCounts = {} as Record<OrderStatus, number>;
  const paymentStatusCounts = {} as Record<PaymentStatus, number>;

  for (const order of all) {
    orderStatusCounts[order.orderStatus] = (orderStatusCounts[order.orderStatus] ?? 0) + 1;
    paymentStatusCounts[order.paymentStatus] =
      (paymentStatusCounts[order.paymentStatus] ?? 0) + 1;
  }

  return NextResponse.json({
    ok: true,
    orders: all,
    counts: { orderStatus: orderStatusCounts, paymentStatus: paymentStatusCounts },
  });
}
