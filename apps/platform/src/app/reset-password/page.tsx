"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { platformApi } from "../../lib/api";
import { AuthShell } from "../../components/AuthShell";

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
          autoComplete="new-password"
        />
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="form-message muted">{message}</p>}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Updating…" : "Update password"}
      </button>
      <p className="form-footer muted">
        <Link href="/">Back to sign in</Link>
      </p>
    </form>
  );
}

export default function PlatformResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use the link from your email, or paste the token below."
    >
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
