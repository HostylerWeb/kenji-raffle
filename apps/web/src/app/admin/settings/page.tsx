"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch, operatorUpload } from "@/lib/api";

type Settings = {
  name: string;
  gra_registry_id: string;
  licence_number: string | null;
  branding: {
    primary_color?: string;
    support_email?: string;
    footer_licence_text?: string;
    logo_url?: string | null;
    social_links?: Record<string, string>;
  };
  analytics?: {
    ga4_measurement_id?: string | null;
    facebook_pixel_id?: string | null;
    analytics_enabled?: boolean;
  };
  legal?: {
    faq_text?: string | null;
    terms_text?: string | null;
    privacy_text?: string | null;
  };
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [tab, setTab] = useState("branding");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [supportEmail, setSupportEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00a551");
  const [footerLicence, setFooterLicence] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [ga4Id, setGa4Id] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [faqText, setFaqText] = useState("");
  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupUrl, setMfaSetupUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaDisableCode, setMfaDisableCode] = useState("");
  const [mfaDisablePassword, setMfaDisablePassword] = useState("");

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    operatorFetch<Settings>("/v1/admin/settings")
      .then((data) => {
        setSettings(data);
        setSupportEmail(data.branding.support_email ?? "");
        setPrimaryColor(data.branding.primary_color ?? "#00a551");
        setFooterLicence(data.branding.footer_licence_text ?? "");
        setLicenceNumber(data.licence_number ?? "");
        setGa4Id(data.analytics?.ga4_measurement_id ?? "");
        setFbPixelId(data.analytics?.facebook_pixel_id ?? "");
        setAnalyticsEnabled(data.analytics?.analytics_enabled ?? false);
        setFaqText(data.legal?.faq_text ?? "");
        setTermsText(data.legal?.terms_text ?? "");
        setPrivacyText(data.legal?.privacy_text ?? "");
        const social = data.branding?.social_links ?? {};
        setSocialFacebook(social.facebook ?? "");
        setSocialTwitter(social.twitter ?? "");
        setSocialInstagram(social.instagram ?? "");
        setLogoUrl(data.branding?.logo_url ?? "");
      })
      .catch(() => router.replace("/admin/login"));
    operatorFetch<{ mfa_enabled: boolean }>("/v1/admin/auth/session")
      .then((s) => setMfaEnabled(s.mfa_enabled))
      .catch(() => undefined);
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await operatorFetch<Settings>("/v1/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          support_email: supportEmail,
          primary_color: primaryColor,
          footer_licence_text: footerLicence,
          licence_number: licenceNumber,
          ga4_measurement_id: ga4Id || null,
          facebook_pixel_id: fbPixelId || null,
          analytics_enabled: analyticsEnabled,
          faq_text: faqText || null,
          terms_text: termsText || null,
          privacy_text: privacyText || null,
          social_links: {
            facebook: socialFacebook || undefined,
            twitter: socialTwitter || undefined,
            instagram: socialInstagram || undefined,
          },
          logo_url: logoUrl || null,
        }),
      });
      setSettings(updated);
      toast("Settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    try {
      await operatorFetch("/v1/admin/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      toast("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed");
    }
  }

  if (!settings) {
    return <p className="muted">Loading…</p>;
  }

  return (
    <OperatorAdminShell
      title="Settings"
      description={`GRA registry ID: ${settings.gra_registry_id} (read-only)`}
      branding={{
        name: settings.name,
        primary_color: settings.branding.primary_color,
      }}
    >
      <AdminTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "branding", label: "Branding" },
          { id: "analytics", label: "Analytics" },
          { id: "legal", label: "Legal" },
          { id: "security", label: "Security" },
        ]}
      />

      {tab !== "security" && (
        <form className="admin-panel" onSubmit={onSubmit}>
          {tab === "branding" && (
            <div className="admin-form-grid">
              <label>
                Licence number
                <input value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} />
              </label>
              <label>
                Support email
                <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </label>
              <label>
                Primary color
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </label>
              <label>
                Logo
                {logoUrl && <img src={logoUrl} alt="Logo" className="admin-media-preview" />}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const uploaded = await operatorUpload("/v1/admin/media/upload", file);
                    setLogoUrl(uploaded.url);
                  }}
                />
              </label>
              <label className="admin-form-grid__full">
                Footer licence text
                <input value={footerLicence} onChange={(e) => setFooterLicence(e.target.value)} />
              </label>
              <label>
                Facebook URL
                <input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} />
              </label>
              <label>
                Twitter / X URL
                <input value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} />
              </label>
              <label>
                Instagram URL
                <input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} />
              </label>
            </div>
          )}
          {tab === "analytics" && (
            <div className="admin-form-grid">
              <label className="admin-form-grid__checkbox">
                <input type="checkbox" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} />
                Enable analytics
              </label>
              <label>
                GA4 Measurement ID
                <input value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} placeholder="G-XXXXXXXX" />
              </label>
              <label>
                Facebook Pixel ID
                <input value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)} />
              </label>
            </div>
          )}
          {tab === "legal" && (
            <div className="admin-form-grid">
              <label className="admin-form-grid__full">
                FAQ text
                <textarea value={faqText} onChange={(e) => setFaqText(e.target.value)} rows={4} />
              </label>
              <label className="admin-form-grid__full">
                Terms text
                <textarea value={termsText} onChange={(e) => setTermsText(e.target.value)} rows={4} />
              </label>
              <label className="admin-form-grid__full">
                Privacy text
                <textarea value={privacyText} onChange={(e) => setPrivacyText(e.target.value)} rows={4} />
              </label>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      )}

      {tab === "security" && (
        <>
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Two-factor authentication</h3>
                <p className="admin-panel__subtitle">
                  {mfaEnabled ? "MFA is enabled on your staff account." : "MFA is not enabled."}
                </p>
              </div>
            </div>
            {!mfaEnabled && (
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    const res = await operatorFetch<{ otpauth_url: string }>(
                      "/v1/admin/auth/mfa/setup",
                      { method: "POST" },
                    );
                    setMfaSetupUrl(res.otpauth_url);
                  }}
                >
                  Generate setup QR
                </button>
                {mfaSetupUrl && <p className="muted">Scan in your authenticator app, then enter the code below.</p>}
                <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="6-digit code" />
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await operatorFetch("/v1/admin/auth/mfa/enable", {
                      method: "POST",
                      body: JSON.stringify({ code: mfaCode }),
                    });
                    setMfaEnabled(true);
                    setMfaCode("");
                    toast("MFA enabled");
                  }}
                >
                  Enable MFA
                </button>
              </div>
            )}
            {mfaEnabled && (
              <div className="admin-form-actions">
                <input value={mfaDisableCode} onChange={(e) => setMfaDisableCode(e.target.value)} placeholder="MFA code" />
                <input
                  type="password"
                  value={mfaDisablePassword}
                  onChange={(e) => setMfaDisablePassword(e.target.value)}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await operatorFetch("/v1/admin/auth/mfa/disable", {
                      method: "POST",
                      body: JSON.stringify({
                        code: mfaDisableCode,
                        password: mfaDisablePassword,
                      }),
                    });
                    setMfaEnabled(false);
                    setMfaDisableCode("");
                    setMfaDisablePassword("");
                    toast("MFA disabled");
                  }}
                >
                  Disable MFA
                </button>
              </div>
            )}
          </div>
          <form className="admin-panel" onSubmit={changePassword}>
            <h3 className="admin-panel__title">Change password</h3>
            <div className="admin-form-grid">
              <label>
                Current password
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </label>
              <label>
                New password
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-secondary">Update password</button>
            </div>
          </form>
        </>
      )}
    </OperatorAdminShell>
  );
}
