import { NextResponse } from "next/server";
import {
  CheckoutNotConfiguredError,
  CheckoutValidationError,
  createCheckoutSession,
} from "@/lib/checkout";
import type { CheckoutRequest } from "@/lib/checkout-types";

// Stripe SDK needs the Node runtime (network + secret key), not Edge.
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") ?? new URL(request.url).origin;

  try {
    const result = await createCheckoutSession(body, origin);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CheckoutNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Online payment isn't configured yet. Please contact us to complete your order.",
        },
        { status: 503 }
      );
    }
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }
    console.error("checkout error", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
