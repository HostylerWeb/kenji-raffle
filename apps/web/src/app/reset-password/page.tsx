"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { playerFetch } from "@/lib/player-api";
import { AuthShell } from "@/components/AuthShell";

function ResetForm() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await playerFetch("/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage("Password updated. You can sign in now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="site-form" onSubmit={onSubmit}>
      <label>
        Token
        <input value={token} onChange={(e) => setToken(e.target.value)} required />
      </label>
      <label>
        New password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
      </label>
      {error && <p className="site-error">{error}</p>}
      {message && <p className="site-success-text">{message}</p>}
      <button type="submit" className="site-btn site-btn--primary site-btn--block" disabled={loading}>
        Update password
      </button>
      <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Use the link from your email or paste the token below.">
      <Suspense fallback={<p className="site-muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
