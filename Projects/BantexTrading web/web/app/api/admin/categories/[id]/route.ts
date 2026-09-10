import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import {
  categoryById,
  deleteCategory,
  updateCategory,
} from "@/lib/catalog/store";
import { toCategoryInput } from "@/lib/catalog/input";
import { CatalogValidationError } from "@/lib/catalog/validate";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function notFound(name: string) {
  return NextResponse.json({ ok: false, error: `${name} not found.` }, { status: 404 });
}

export async function GET(_request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const category = categoryById(id);
  if (!category) return notFound("Category");
  return NextResponse.json({ ok: true, category });
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
    const category = updateCategory(id, toCategoryInput(body));
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Category not found.") {
      return notFound("Category");
    }
    console.error("update category error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save the category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  let body: { replaceWithId?: string } = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }
  try {
    deleteCategory(id, body.replaceWithId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found.") {
      return notFound("Category");
    }
    // Delete protection: category still holds products. Surface the message.
    if (error instanceof Error && error.message.includes("still has")) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
    }
    console.error("delete category error", error);
    return NextResponse.json(
      { ok: false, error: "Could not delete the category." },
      { status: 500 }
    );
  }
}
