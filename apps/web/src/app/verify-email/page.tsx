"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { playerFetch } from "@/lib/player-api";
import { AuthShell } from "@/components/AuthShell";

function VerifyForm() {
  const params = useSearchParams();
  const tokenFromUrl = params.get("token");
  const [token, setToken] = useState(tokenFromUrl ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyWithToken(value: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await playerFetch("/v1/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token: value }),
      });
      setMessage("Email verified. You can now log in and purchase tickets.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenFromUrl) verifyWithToken(tokenFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await verifyWithToken(token);
  }

  return (
    <form className="site-form" onSubmit={onSubmit}>
      <label>
        Verification token
        <input value={token} onChange={(e) => setToken(e.target.value)} required />
      </label>
      {error && <p className="site-error">{error}</p>}
      {message && <p className="site-success-text">{message}</p>}
      <button type="submit" className="site-btn site-btn--primary site-btn--block" disabled={loading}>
        {loading ? "Verifying…" : "Verify email"}
      </button>
      <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" subtitle="Paste the token from your verification email.">
      <Suspense fallback={<p className="site-muted">Loading…</p>}>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
