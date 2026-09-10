import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { createProduct, getProducts } from "@/lib/catalog/store";
import { toProductInput } from "@/lib/catalog/input";
import { CatalogValidationError } from "@/lib/catalog/validate";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, products: getProducts() });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const product = createProduct(toProductInput(body));
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error("create product error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save the product." },
      { status: 500 }
    );
  }
}
