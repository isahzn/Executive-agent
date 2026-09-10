import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  passwordConfigured,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/auth";

// Server-side login for the admin dashboard. Verifies the password against the
// ADMIN_PASSWORD env var (constant-time) and, on success, sets an HttpOnly,
// signed session cookie. Never returns or exposes the password.
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!passwordConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin login isn't configured yet. Set ADMIN_PASSWORD." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const password = body.password ?? "";
  if (!passwordMatches(password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    ...sessionCookieOptions(),
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
