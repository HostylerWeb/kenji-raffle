"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { platformApi } from "../../lib/api";

function ResetForm() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${platformApi}/v1/platform/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Reset failed",
        );
      }
      setMessage("Password updated. You can sign in now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Token
        <input value={token} onChange={(e) => setToken(e.target.value)} required />
      </label>
      <label>
        New password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="muted">{message}</p>}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Updating…" : "Update password"}
      </button>
      <p className="muted" style={{ marginTop: 16 }}>
        <Link href="/">Back to sign in</Link>
      </p>
    </form>
  );
}

export default function PlatformResetPasswordPage() {
  return (
    <main className="login-page">
      <h1>Reset password</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Use the link from your email, or paste the token, then choose a new password.
      </p>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
