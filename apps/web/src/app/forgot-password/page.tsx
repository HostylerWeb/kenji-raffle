"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { playerFetch } from "@/lib/player-api";

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
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Forgot password</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p style={{ color: "#15803d" }}>{message}</p>}
        <button type="submit" className="btn" disabled={loading}>Send reset link</button>
      </form>
      <p style={{ marginTop: 16 }}><Link href="/login">Back to login</Link></p>
    </main>
  );
}
