"use client";

import {
  SITE_THEME_PRESETS,
  extractThemeConfig,
  resolveSiteTheme,
  type SiteThemeColors,
  type SiteThemePresetId,
} from "@kenji-raffle/shared/site-theme";
import { operatorUpload } from "@/lib/api";

type BrandingEditorProps = {
  operatorName: string;
  logoUrl: string;
  footerLogoUrl: string;
  primaryColor: string;
  themePreset: SiteThemePresetId;
  themeColors: SiteThemeColors;
  footerLicence: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  licenceNumber: string;
  supportEmail: string;
  onLogoUrl: (url: string) => void;
  onFooterLogoUrl: (url: string) => void;
  onPrimaryColor: (color: string) => void;
  onThemePreset: (preset: SiteThemePresetId) => void;
  onThemeColors: (colors: SiteThemeColors) => void;
  onFooterLicence: (value: string) => void;
  onSocialFacebook: (value: string) => void;
  onSocialTwitter: (value: string) => void;
  onSocialInstagram: (value: string) => void;
  onLicenceNumber: (value: string) => void;
  onSupportEmail: (value: string) => void;
};

const COLOR_FIELDS: { key: keyof SiteThemeColors; label: string }[] = [
  { key: "accent", label: "Brand accent" },
  { key: "headerBg", label: "Header background" },
  { key: "headerText", label: "Header text" },
  { key: "headerLink", label: "Header links (active)" },
  { key: "footerBg", label: "Footer background" },
  { key: "footerText", label: "Footer text" },
  { key: "footerLink", label: "Footer links" },
  { key: "buttonBg", label: "Button background" },
  { key: "buttonText", label: "Button text" },
  { key: "linkColor", label: "Content links" },
  { key: "linkHover", label: "Content links (hover)" },
];

function LogoUpload({
  label,
  hint,
  url,
  onUploaded,
}: {
  label: string;
  hint: string;
  url: string;
  onUploaded: (url: string) => void;
}) {
  return (
    <div className="admin-branding-upload">
      <p className="admin-branding-upload__label">{label}</p>
      <p className="admin-branding-upload__hint">{hint}</p>
      {url ? (
        <img src={url} alt="" className="admin-media-preview admin-branding-upload__preview" />
      ) : (
        <div className="admin-branding-upload__placeholder">No logo uploaded</div>
      )}
      <label className="admin-file-upload" style={{ marginTop: 8 }}>
        <span className="admin-file-upload__label">Upload image</span>
        <span className="admin-file-upload__hint">PNG, JPEG, or WebP</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const uploaded = await operatorUpload("/v1/admin/media/upload", file);
            onUploaded(uploaded.url);
          }}
        />
      </label>
      {url && (
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => onUploaded("")}>
          Remove
        </button>
      )}
    </div>
  );
}

export function BrandingEditor(props: BrandingEditorProps) {
  const {
    operatorName,
    logoUrl,
    footerLogoUrl,
    primaryColor,
    themePreset,
    themeColors,
    footerLicence,
    socialFacebook,
    socialTwitter,
    socialInstagram,
    licenceNumber,
    supportEmail,
    onLogoUrl,
    onFooterLogoUrl,
    onPrimaryColor,
    onThemePreset,
    onThemeColors,
    onFooterLicence,
    onSocialFacebook,
    onSocialTwitter,
    onSocialInstagram,
    onLicenceNumber,
    onSupportEmail,
  } = props;

  function applyPreset(preset: Exclude<SiteThemePresetId, "custom">) {
    const presetTheme = SITE_THEME_PRESETS[preset];
    const { label: _l, description: _d, ...colors } = presetTheme;
    onThemePreset(preset);
    onThemeColors(colors);
    onPrimaryColor(colors.accent);
  }

  function updateColor(key: keyof SiteThemeColors, value: string) {
    onThemePreset("custom");
    onThemeColors({ ...themeColors, [key]: value });
    if (key === "accent") onPrimaryColor(value);
  }

  const previewTheme = resolveSiteTheme({
    themePreset,
    primaryColor,
    themeConfig: extractThemeConfig(themeColors),
  });

  return (
    <div className="admin-branding">
      <section className="admin-branding__section">
        <h4 className="admin-branding__heading">Colour templates</h4>
        <p className="admin-panel__subtitle" style={{ marginTop: 0 }}>
          Pick a professional preset, then fine-tune individual colours below if needed.
        </p>
        <div className="admin-theme-presets">
          {(Object.keys(SITE_THEME_PRESETS) as Exclude<SiteThemePresetId, "custom">[]).map((id) => {
            const preset = SITE_THEME_PRESETS[id];
            return (
              <button
                key={id}
                type="button"
                className={`admin-theme-preset${themePreset === id ? " admin-theme-preset--active" : ""}`}
                onClick={() => applyPreset(id)}
              >
                <span className="admin-theme-preset__swatches" aria-hidden>
                  <span style={{ background: preset.headerBg, border: "1px solid #e2e8f0" }} />
                  <span style={{ background: preset.accent }} />
                  <span style={{ background: preset.footerBg.includes("gradient") ? "#0f172a" : preset.footerBg }} />
                </span>
                <span className="admin-theme-preset__label">{preset.label}</span>
                <span className="admin-theme-preset__desc">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-branding__section admin-branding__preview-wrap">
        <h4 className="admin-branding__heading">Live preview</h4>
        <div
          className="admin-branding-preview"
          style={{
            ["--site-header-bg" as string]: previewTheme.headerBg,
            ["--site-header-text" as string]: previewTheme.headerText,
            ["--site-header-link" as string]: previewTheme.headerLink,
            ["--site-footer-bg" as string]: previewTheme.footerBg,
            ["--site-footer-text" as string]: previewTheme.footerText,
            ["--site-footer-link" as string]: previewTheme.footerLink,
            ["--site-button-bg" as string]: previewTheme.buttonBg,
            ["--site-button-text" as string]: previewTheme.buttonText,
            ["--site-link-color" as string]: previewTheme.linkColor,
            ["--site-accent" as string]: previewTheme.accent,
          }}
        >
          <div className="admin-branding-preview__header">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="admin-branding-preview__logo" />
            ) : (
              <span className="admin-branding-preview__mark">{operatorName.charAt(0)}</span>
            )}
            <span>{operatorName}</span>
            <span className="admin-branding-preview__nav">Raffles · Winners</span>
          </div>
          <div className="admin-branding-preview__body">
            <button type="button" className="admin-branding-preview__btn">Enter raffle</button>
            <a href="#preview" className="admin-branding-preview__link" onClick={(e) => e.preventDefault()}>
              Sample link
            </a>
          </div>
          <div className="admin-branding-preview__footer">
            {footerLogoUrl ? (
              <img src={footerLogoUrl} alt="" className="admin-branding-preview__footer-logo" />
            ) : (
              <strong>{operatorName}</strong>
            )}
            <span>Support · Terms · Privacy</span>
          </div>
        </div>
      </section>

      <section className="admin-branding__section">
        <h4 className="admin-branding__heading">Logos</h4>
        <div className="admin-form-grid">
          <LogoUpload
            label="Header logo"
            hint="Shown in the site header and login pages."
            url={logoUrl}
            onUploaded={onLogoUrl}
          />
          <LogoUpload
            label="Footer logo"
            hint="Optional — replaces the operator name in the footer."
            url={footerLogoUrl}
            onUploaded={onFooterLogoUrl}
          />
        </div>
      </section>

      <section className="admin-branding__section">
        <h4 className="admin-branding__heading">Custom colours</h4>
        <p className="admin-panel__subtitle" style={{ marginTop: 0 }}>
          {themePreset === "custom"
            ? "You are using custom colours."
            : "Adjust any colour to switch to a custom theme."}
        </p>
        <div className="admin-form-grid">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key}>
              {label}
              <input
                type="color"
                value={themeColors[key].startsWith("#") ? themeColors[key] : "#000000"}
                onChange={(e) => updateColor(key, e.target.value)}
                disabled={!themeColors[key].startsWith("#")}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="admin-branding__section">
        <h4 className="admin-branding__heading">Site details</h4>
        <div className="admin-form-grid">
          <label>
            Licence number
            <input value={licenceNumber} onChange={(e) => onLicenceNumber(e.target.value)} />
          </label>
          <label>
            Support email
            <input type="email" value={supportEmail} onChange={(e) => onSupportEmail(e.target.value)} />
          </label>
          <label className="admin-form-grid__full">
            Footer licence text
            <input value={footerLicence} onChange={(e) => onFooterLicence(e.target.value)} />
          </label>
          <label>
            Facebook URL
            <input value={socialFacebook} onChange={(e) => onSocialFacebook(e.target.value)} />
          </label>
          <label>
            Twitter / X URL
            <input value={socialTwitter} onChange={(e) => onSocialTwitter(e.target.value)} />
          </label>
          <label>
            Instagram URL
            <input value={socialInstagram} onChange={(e) => onSocialInstagram(e.target.value)} />
          </label>
        </div>
      </section>
    </div>
  );
}
