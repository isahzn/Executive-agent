"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    // Read the password from the DOM at submit time. iOS Safari autofill can
    // fill the field without firing React's onChange, which would leave a
    // controlled value (and thus a submit-restricting disabled state) stale.
    const password = inputRef.current?.value ?? "";
    if (!password.trim()) {
      setError("Enter your admin password.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(data.error ?? "Could not sign you in.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login__form" onSubmit={onSubmit} noValidate>
      <label className="admin-login__field">
        <span className="admin-login__label">Password</span>
        <input
          ref={inputRef}
          type="password"
          name="password"
          defaultValue=""
          autoComplete="current-password"
          autoFocus
          className="admin-login__input"
          placeholder="Enter your admin password"
        />
      </label>

      {error && <p className="admin-login__error">{error}</p>}

      <button type="submit" className="admin-login__submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
