import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
