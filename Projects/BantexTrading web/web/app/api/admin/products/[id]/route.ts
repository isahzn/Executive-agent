import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { deleteProduct, productById, updateProduct } from "@/lib/catalog/store";
import { toProductInput } from "@/lib/catalog/input";
import { CatalogValidationError } from "@/lib/catalog/validate";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const product = productById(id);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, product });
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
  try {
    const product = updateProduct(id, toProductInput(body));
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Product not found.") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("update product error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save the product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found.") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("delete product error", error);
    return NextResponse.json(
      { ok: false, error: "Could not delete the product." },
      { status: 500 }
    );
  }
}
