"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { playerFetch } from "@/lib/player-api";

export default function VerifyEmailPage() {
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
    if (tokenFromUrl) {
      verifyWithToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await verifyWithToken(token);
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Verify email</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Verification token
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p style={{ color: "#15803d" }}>{message}</p>}
        <button type="submit" className="btn" disabled={loading}>
          Verify
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  );
}
