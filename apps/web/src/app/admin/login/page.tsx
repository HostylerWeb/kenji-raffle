"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTenantHost, tenantApi, setOperatorSession } from "@/lib/api";

export default function OperatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("Operator Console");
  const [accent, setAccent] = useState("#00a551");

  useEffect(() => {
    fetch(`${tenantApi}/v1/tenant/context`, {
      headers: { "x-forwarded-host": getTenantHost() },
    })
      .then((r) => r.json())
      .then((ctx) => {
        if (ctx.name) setSiteName(ctx.name);
        if (ctx.branding?.primary_color) setAccent(ctx.branding.primary_color);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const root = document.querySelector(".admin-root") as HTMLElement | null;
    if (root) {
      root.style.setProperty("--admin-accent", accent);
      root.style.setProperty(
        "--admin-accent-soft",
        `color-mix(in srgb, ${accent} 14%, transparent)`,
      );
    }
  }, [accent]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${tenantApi}/v1/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-host": getTenantHost(),
        },
        body: JSON.stringify({
          email,
          password,
          mfa_code: needsMfa ? mfaCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Login failed",
        );
      }
      if (data.mfa_required) {
        setNeedsMfa(true);
        return;
      }
      setOperatorSession(data.access_token, data.user, data.refresh_token);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__hero">
        <div className="admin-login__hero-content">
          <div className="admin-login__logo">{siteName}</div>
          <h1>Manage your raffle business with confidence</h1>
          <p>
            {siteName} operator console — raffles, orders, players, compliance,
            and reports in one place.
          </p>
        </div>
        <div className="admin-login__features">
          <div className="admin-login__feature">
            <span className="admin-login__feature-dot" />
            Real-time sales and ticket inventory
          </div>
          <div className="admin-login__feature">
            <span className="admin-login__feature-dot" />
            GRA compliance and audit trail
          </div>
          <div className="admin-login__feature">
            <span className="admin-login__feature-dot" />
            Secure staff access with MFA
          </div>
        </div>
      </div>

      <div className="admin-login__form-panel">
        <div className="admin-login__form-wrap">
          <h2>Sign in</h2>
          <p className="admin-login__subtitle">
            Enter your operator staff credentials to continue.
          </p>

          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@demo.local"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {needsMfa && (
              <label>
                MFA code
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                />
              </label>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing in…" : needsMfa ? "Verify MFA" : "Sign in"}
            </button>
          </form>

          <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
            <Link href="/admin/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
