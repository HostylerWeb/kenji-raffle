"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { operatorFetch } from "@/lib/api";

function ResetForm() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await operatorFetch("/v1/admin/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage("Password updated. You can sign in now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    }
  }

  return (
    <div className="admin-login__form-wrap">
      <h2>Set new password</h2>
      <p className="admin-login__subtitle">Enter the token from your email and a new password.</p>
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
        {message && <p style={{ color: "#15803d", fontSize: 14 }}>{message}</p>}
        <button type="submit" className="btn">Update password</button>
      </form>
      <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
        <Link href="/admin/login">Back to login</Link>
      </p>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="admin-login">
      <div className="admin-login__hero">
        <div className="admin-login__hero-content">
          <div className="admin-login__logo">Kenji Raffle</div>
          <h1>Choose a strong new password</h1>
          <p>Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
      </div>
      <div className="admin-login__form-panel">
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
