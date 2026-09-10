import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { createCategory, getCategories } from "@/lib/catalog/store";
import { toCategoryInput } from "@/lib/catalog/input";
import { CatalogValidationError } from "@/lib/catalog/validate";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, categories: getCategories() });
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
    const category = createCategory(toCategoryInput(body));
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error("create category error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save the category." },
      { status: 500 }
    );
  }
}
