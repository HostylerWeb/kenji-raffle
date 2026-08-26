"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getCartSessionId, playerFetch, setPlayerSession } from "@/lib/player-api";

type PlayerLoginFormProps = {
  onAuthenticated?: () => void | Promise<void>;
  submitLabel?: string;
  next?: string;
  compact?: boolean;
  idPrefix?: string;
};

export function PlayerLoginForm({
  onAuthenticated,
  submitLabel = "Sign in",
  next = "/",
  compact = false,
  idPrefix = "player-login",
}: PlayerLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await playerFetch<{
        access_token: string;
        refresh_token: string;
      }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          cart_session_id: getCartSessionId(),
        }),
      });
      setPlayerSession(res.access_token, res.refresh_token);
      await onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="site-form" onSubmit={onSubmit} noValidate>
      <label htmlFor={`${idPrefix}-email`}>
        Email
        <input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-invalid={error ? true : undefined}
        />
      </label>
      <label htmlFor={`${idPrefix}-password`}>
        Password
        <input
          id={`${idPrefix}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
        />
      </label>
      {error && (
        <p className="site-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="site-btn site-btn--primary site-btn--block"
        disabled={loading}
      >
        {loading ? "Signing in…" : submitLabel}
      </button>
      {!compact && (
        <>
          <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
            <Link href={`/forgot-password?next=${encodeURIComponent(next)}`}>
              Forgot password?
            </Link>
          </p>
          <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
            No account?{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`}>Register</Link>
          </p>
        </>
      )}
      {compact && (
        <p className="site-muted" style={{ textAlign: "center", margin: 0, fontSize: 13 }}>
          <Link href={`/forgot-password?next=${encodeURIComponent(next)}`}>
            Forgot password?
          </Link>
        </p>
      )}
    </form>
  );
}
