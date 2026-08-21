"use client";

import { FormEvent, useEffect, useState } from "react";
import { MfaQrCode } from "./MfaQrCode";
import { platformFetch, redirectToLogin } from "../lib/api";

type SessionInfo = {
  mfa_enabled: boolean;
  user: { email: string };
};

export function PlatformAccountSecurity() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [mfaSetupUrl, setMfaSetupUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");
  const [disableMfaPassword, setDisableMfaPassword] = useState("");
  const [mfaStep, setMfaStep] = useState<"idle" | "scan" | "enabled">("idle");
  const [mfaBusy, setMfaBusy] = useState(false);

  useEffect(() => {
    platformFetch<SessionInfo>("/v1/platform/auth/session")
      .then((s) => {
        setSession(s);
        setMfaStep(s.mfa_enabled ? "enabled" : "idle");
      })
      .catch(() => undefined);
  }, []);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    try {
      await platformFetch("/v1/platform/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      redirectToLogin();
    } catch (err) {
      setPasswordMessage(
        err instanceof Error ? err.message : "Password change failed",
      );
    }
  }

  async function startMfaSetup() {
    setMfaMessage("");
    try {
      const result = await platformFetch<{ otpauth_url: string }>(
        "/v1/platform/auth/mfa/setup",
        { method: "POST" },
      );
      setMfaSetupUrl(result.otpauth_url);
      setMfaStep("scan");
      setMfaMessage(
        "Scan the QR code with Google Authenticator, then enter the 6-digit code.",
      );
    } catch (err) {
      setMfaMessage(err instanceof Error ? err.message : "Setup failed");
    }
  }

  async function enableMfa(e: FormEvent) {
    e.preventDefault();
    setMfaMessage("");
    setMfaBusy(true);
    try {
      await platformFetch("/v1/platform/auth/mfa/enable", {
        method: "POST",
        body: JSON.stringify({ code: mfaCode }),
      });
      // Server revokes sessions on enable — do not call logout (401 refresh loop).
      redirectToLogin();
    } catch (err) {
      setMfaBusy(false);
      setMfaMessage(err instanceof Error ? err.message : "Invalid code");
    }
  }

  async function disableMfa(e: FormEvent) {
    e.preventDefault();
    setMfaMessage("");
    try {
      await platformFetch("/v1/platform/auth/mfa/disable", {
        method: "POST",
        body: JSON.stringify({
          code: mfaCode,
          password: disableMfaPassword,
        }),
      });
      setSession((s) => (s ? { ...s, mfa_enabled: false } : s));
      setMfaStep("idle");
      setMfaCode("");
      setDisableMfaPassword("");
      setMfaMessage("Two-factor authentication disabled.");
    } catch (err) {
      setMfaMessage(err instanceof Error ? err.message : "Disable failed");
    }
  }

  const manualSecret =
    mfaSetupUrl.split("secret=")[1]?.split("&")[0] ?? "";

  return (
    <div className="security-grid">
      <section className="card security-card">
        <h2>Change password</h2>
        <p className="muted">
          You will be signed out after changing your password.
        </p>
        <form className="form" onSubmit={changePassword}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn btn-secondary">
            Update password
          </button>
          {passwordMessage && <p className="muted">{passwordMessage}</p>}
        </form>
      </section>

      <section className="card security-card">
        <h2>Two-factor authentication (2FA)</h2>
        <p className="muted">
          Google Authenticator or any TOTP app. Sign-in requires password plus
          app code once enabled.
        </p>

        {session && (
          <p className="security-status">
            Status:{" "}
            <span
              className={
                session.mfa_enabled ? "status-pill status-ok" : "status-pill"
              }
            >
              {session.mfa_enabled ? "Enabled" : "Not enabled"}
            </span>
          </p>
        )}

        {mfaMessage && <p className="muted">{mfaMessage}</p>}

        {mfaStep === "idle" && !session?.mfa_enabled && (
          <button type="button" className="btn" onClick={startMfaSetup}>
            Turn on 2FA
          </button>
        )}

        {mfaStep === "scan" && mfaSetupUrl && (
          <div className="mfa-setup">
            <MfaQrCode value={mfaSetupUrl} />
            <p className="muted" style={{ fontSize: 13 }}>
              Account: {session?.user.email}
            </p>
            {manualSecret && (
              <details className="muted" style={{ fontSize: 12 }}>
                <summary>Can&apos;t scan? Enter key manually</summary>
                <code className="mfa-secret">{manualSecret}</code>
              </details>
            )}
            <form className="form" onSubmit={enableMfa}>
              <label>
                6-digit code from app
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  minLength={6}
                  maxLength={8}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  disabled={mfaBusy}
                />
              </label>
              <button type="submit" className="btn" disabled={mfaBusy}>
                {mfaBusy ? "Enabling…" : "Confirm and enable 2FA"}
              </button>
            </form>
          </div>
        )}

        {(mfaStep === "enabled" || session?.mfa_enabled) && (
          <form className="form" onSubmit={disableMfa}>
            <label>
              Current 2FA code
              <input
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                minLength={6}
                autoComplete="one-time-code"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={disableMfaPassword}
                onChange={(e) => setDisableMfaPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn btn-secondary">
              Turn off 2FA
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
