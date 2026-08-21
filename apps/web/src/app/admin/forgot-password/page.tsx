"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { operatorFetch } from "@/lib/api";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await operatorFetch("/v1/admin/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("If that email is registered, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__hero">
        <div className="admin-login__hero-content">
          <div className="admin-login__logo">Kenji Raffle</div>
          <h1>Reset your password</h1>
          <p>We&apos;ll send a secure link to your staff email address.</p>
        </div>
      </div>
      <div className="admin-login__form-panel">
        <div className="admin-login__form-wrap">
          <h2>Forgot password</h2>
          <p className="admin-login__subtitle">Enter your operator staff email.</p>
          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            {message && <p style={{ color: "#15803d", fontSize: 14 }}>{message}</p>}
            <button type="submit" className="btn">Send reset link</button>
          </form>
          <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
            <Link href="/admin/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
