"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { platformApi, setAuthSession } from "../lib/api";
import { AuthShell } from "../components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${platformApi}/v1/platform/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          mfa_code: mfaCode || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Login failed",
        );
      }
      if (data.mfa_required) {
        setMfaRequired(true);
        setError("");
        return;
      }
      setAuthSession(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setForgotMessage("");
    try {
      const res = await fetch(`${platformApi}/v1/platform/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setForgotMessage(data.message ?? "Check your email if an account exists.");
    } catch {
      setForgotMessage("Request failed. Try again later.");
    }
  }

  return (
    <AuthShell
      title={forgotMode ? "Reset your password" : "Sign in"}
      subtitle={
        forgotMode
          ? "Enter your email and we will send a secure reset link."
          : "Use your platform administrator credentials."
      }
    >
      {forgotMode ? (
        <form className="form" onSubmit={onForgot}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          {forgotMessage && <p className="form-message muted">{forgotMessage}</p>}
          <button type="submit" className="btn">
            Send reset link
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setForgotMode(false)}
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {mfaRequired && (
            <>
              <p className="muted login-step">
                Step 2 — open your authenticator app and enter the 6-digit code.
              </p>
              <label>
                2FA code
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  minLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </label>
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing in…" : mfaRequired ? "Verify MFA" : "Sign in"}
          </button>
          <p className="form-footer muted">
            <button
              type="button"
              className="link-btn"
              onClick={() => setForgotMode(true)}
            >
              Forgot password?
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
