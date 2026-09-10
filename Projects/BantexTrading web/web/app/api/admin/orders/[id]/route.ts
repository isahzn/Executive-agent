import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { orders } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/orders/types";
import type { OrderStatus } from "@/lib/orders/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const order = orders.getById(id);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const candidate = b.orderStatus;
  // Order status is the only fulfilment field the admin edits by hand. Payment
  // status comes from Stripe; it is never accepted from the client.
  if (
    typeof candidate !== "string" ||
    !ORDER_STATUSES.includes(candidate as OrderStatus)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid order status." },
      { status: 400 }
    );
  }

  const order = orders.updateOrderStatus(id, candidate as OrderStatus);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order });
}
