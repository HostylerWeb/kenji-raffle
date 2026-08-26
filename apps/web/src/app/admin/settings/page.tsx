"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  extractThemeConfig,
  resolveSiteTheme,
  DEFAULT_SITE_FONTS,
  type SiteThemeColors,
  type SiteThemeFonts,
  type SiteThemePresetId,
} from "@kenji-raffle/shared/site-theme";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminMfaPanel } from "@/components/admin/AdminMfaPanel";
import { BrandingEditor } from "@/components/admin/BrandingEditor";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type Settings = {
  name: string;
  gra_registry_id: string;
  licence_number: string | null;
  branding: {
    primary_color?: string;
    support_email?: string;
    footer_licence_text?: string;
    logo_url?: string | null;
    footer_logo_url?: string | null;
    theme_preset?: string;
    theme_config?: Record<string, unknown> | null;
    theme?: SiteThemeColors & { preset?: string };
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

function defaultTheme(): { colors: SiteThemeColors; fonts: SiteThemeFonts } {
  const resolved = resolveSiteTheme({ themePreset: "kenji-green", primaryColor: "#00a551", themeConfig: null });
  const { preset: _p, fonts, ...colors } = resolved;
  return { colors, fonts };
}

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
  const [footerLogoUrl, setFooterLogoUrl] = useState("");
  const [themePreset, setThemePreset] = useState<SiteThemePresetId>("kenji-green");
  const [themeColors, setThemeColors] = useState<SiteThemeColors>(() => defaultTheme().colors);
  const [themeFonts, setThemeFonts] = useState<SiteThemeFonts>(() => defaultTheme().fonts);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

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
        setFooterLogoUrl(data.branding?.footer_logo_url ?? "");
        const preset = (data.branding?.theme_preset ?? "kenji-green") as SiteThemePresetId;
        setThemePreset(preset);
        const resolved = resolveSiteTheme({
          themePreset: preset,
          primaryColor: data.branding.primary_color,
          themeConfig: data.branding.theme_config ?? null,
        });
        const { preset: _p, fonts, ...colors } = resolved;
        setThemeColors(colors);
        setThemeFonts(fonts);
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
          footer_logo_url: footerLogoUrl || null,
          theme_preset: themePreset,
          theme_config: extractThemeConfig(themeColors, themeFonts),
        }),
      });
      setSettings(updated);
      toast("Settings saved — preview your public site to see changes.");
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
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        Loading settings…
      </div>
    );
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
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">
                {tab === "branding" && "Branding & site identity"}
                {tab === "analytics" && "Analytics & tracking"}
                {tab === "legal" && "Legal pages"}
              </h3>
              <p className="admin-panel__subtitle">
                {tab === "branding" &&
                  "Customize your public site before go-live — logos, colours, and templates."}
                {tab === "analytics" && "Optional GA4 and Facebook Pixel integration."}
                {tab === "legal" && "FAQ, terms, and privacy content for players."}
              </p>
            </div>
          </div>
          <div className="admin-panel__body">
            {tab === "branding" && (
              <BrandingEditor
                operatorName={settings.name}
                logoUrl={logoUrl}
                footerLogoUrl={footerLogoUrl}
                primaryColor={primaryColor}
                themePreset={themePreset}
                themeColors={themeColors}
                themeFonts={themeFonts}
                footerLicence={footerLicence}
                socialFacebook={socialFacebook}
                socialTwitter={socialTwitter}
                socialInstagram={socialInstagram}
                licenceNumber={licenceNumber}
                supportEmail={supportEmail}
                onLogoUrl={setLogoUrl}
                onFooterLogoUrl={setFooterLogoUrl}
                onPrimaryColor={setPrimaryColor}
                onThemePreset={setThemePreset}
                onThemeColors={setThemeColors}
                onThemeFonts={setThemeFonts}
                onFooterLicence={setFooterLicence}
                onSocialFacebook={setSocialFacebook}
                onSocialTwitter={setSocialTwitter}
                onSocialInstagram={setSocialInstagram}
                onLicenceNumber={setLicenceNumber}
                onSupportEmail={setSupportEmail}
              />
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
          </div>
          <div className="admin-form-actions" style={{ padding: "0 22px 22px" }}>
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
                  {mfaEnabled ? "MFA is enabled on your staff account." : "Protect your account with an authenticator app."}
                </p>
              </div>
            </div>
            <AdminMfaPanel
              mfaEnabled={mfaEnabled}
              onStatusChange={setMfaEnabled}
              showSettingsLink={false}
            />
          </div>
          <form className="admin-panel" onSubmit={changePassword}>
            <div className="admin-panel__header">
              <div>
                <h3 className="admin-panel__title">Change password</h3>
                <p className="admin-panel__subtitle">Update your staff account password.</p>
              </div>
            </div>
            <div className="admin-panel__body">
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
            </div>
            <div className="admin-form-actions" style={{ padding: "0 22px 22px" }}>
              <button type="submit" className="btn btn-secondary">Update password</button>
            </div>
          </form>
        </>
      )}
    </OperatorAdminShell>
  );
}
