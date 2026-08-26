"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { playerFetch } from "@/lib/player-api";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await playerFetch("/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("If that email is registered, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter your email and we'll send a reset link.">
      <form className="site-form" onSubmit={onSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        {error && <p className="site-error">{error}</p>}
        {message && <p className="site-success-text">{message}</p>}
        <button type="submit" className="site-btn site-btn--primary site-btn--block" disabled={loading}>
          Send reset link
        </button>
        <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
