// Server-only admin authentication. Credentials come from environment variables
// (never hard-coded in source): the login password is ADMIN_PASSWORD and session
// cookies are signed with ADMIN_SESSION_SECRET. Only this module reads those
// secrets; nothing is ever exposed to the browser.
//
// Guard pattern: the /admin layout calls requireAdmin() (redirects to /admin/login
// when unauthenticated), and every /api/admin/* mutation re-verifies the session
// with isAdminRequest() so it can never be bypassed by a hidden button.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "bantex_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function passwordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iat: now, exp: now + SESSION_TTL_SECONDS })
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token: string): boolean {
  if (!secret()) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.exp === "number" && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// Constant-time string comparison for the login password.
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  const len = Math.max(a.length, b.length, 1);
  const ba = Buffer.alloc(len);
  const bb = Buffer.alloc(len);
  a.copy(ba);
  b.copy(bb);
  return timingSafeEqual(ba, bb) && a.length === b.length;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return typeof token === "string" && verifyToken(token);
}

// Server Component guard — redirects unauthenticated users to /admin/login.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

// API route guard — returns true when the request carries a valid session.
export async function isAdminRequest(): Promise<boolean> {
  return isAdmin();
}

// Build the cookie options shared by login/logout. HttpOnly keeps the token
// out of JS; SameSite=Lax and Secure (in production) harden against CSRF.
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export { COOKIE_NAME, SESSION_TTL_SECONDS };
