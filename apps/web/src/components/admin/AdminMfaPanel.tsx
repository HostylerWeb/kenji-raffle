"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminToast } from "@/components/admin/AdminToast";
import { operatorFetch } from "@/lib/api";

type Props = {
  mfaEnabled: boolean;
  mfaPending?: boolean;
  onStatusChange?: (enabled: boolean) => void;
  compact?: boolean;
  showSettingsLink?: boolean;
};

export function AdminMfaPanel({
  mfaEnabled,
  mfaPending = false,
  onStatusChange,
  compact = false,
  showSettingsLink = true,
}: Props) {
  const { toast } = useAdminToast();
  const [enabled, setEnabled] = useState(mfaEnabled);
  const [pending, setPending] = useState(mfaPending);
  const [setupUrl, setSetupUrl] = useState("");
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);

  function updateEnabled(next: boolean) {
    setEnabled(next);
    onStatusChange?.(next);
  }

  async function generateSetup() {
    setLoading(true);
    try {
      const res = await operatorFetch<{ otpauth_url: string }>(
        "/v1/admin/auth/mfa/setup",
        { method: "POST" },
      );
      setSetupUrl(res.otpauth_url);
      setPending(true);
      toast("Scan the QR code in your authenticator app");
    } catch (err) {
      toast(err instanceof Error ? err.message : "MFA setup failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function enableMfa() {
    setLoading(true);
    try {
      await operatorFetch("/v1/admin/auth/mfa/enable", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setCode("");
      setSetupUrl("");
      setPending(false);
      updateEnabled(true);
      toast("MFA enabled");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  }

  async function disableMfa() {
    setLoading(true);
    try {
      await operatorFetch("/v1/admin/auth/mfa/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode, password: disablePassword }),
      });
      setDisableCode("");
      setDisablePassword("");
      setPending(false);
      updateEnabled(false);
      toast("MFA disabled");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not disable MFA", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "admin-panel__body"}>
      <div style={{ marginBottom: 12 }}>
        <AdminStatusBadge status={enabled ? "active" : pending ? "pending" : "cancelled"} />
        {" "}
        {enabled ? "Enabled" : pending ? "Setup in progress" : "Not enabled"}
      </div>

      {!enabled && (
        <div className="admin-form-actions" style={{ marginTop: 0, flexDirection: "column", alignItems: "stretch" }}>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => generateSetup()}>
            {setupUrl ? "Regenerate QR" : "Generate setup QR"}
          </button>
          {setupUrl && (
            <>
              <p className="muted" style={{ margin: "8px 0", fontSize: 13 }}>
                Scan in Google Authenticator, 1Password, or similar, then enter the 6-digit code.
              </p>
              <a
                href={setupUrl}
                className="admin-code"
                style={{ wordBreak: "break-all", fontSize: 11 }}
                target="_blank"
                rel="noreferrer"
              >
                Open otpauth link
              </a>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button type="button" className="btn" disabled={loading || !code.trim()} onClick={() => enableMfa()}>
                Enable MFA
              </button>
            </>
          )}
        </div>
      )}

      {enabled && (
        <div className="admin-form-actions" style={{ marginTop: 0, flexDirection: "column", alignItems: "stretch" }}>
          <input
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            placeholder="Current MFA code"
            inputMode="numeric"
          />
          <input
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Account password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading || !disableCode.trim() || !disablePassword}
            onClick={() => disableMfa()}
          >
            Disable MFA
          </button>
        </div>
      )}

      {!compact && showSettingsLink && (
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          You can also manage MFA under <Link href="/admin/settings">Settings → Security</Link>.
        </p>
      )}
    </div>
  );
}
