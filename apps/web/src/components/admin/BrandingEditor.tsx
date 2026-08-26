"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BRANDING_DRAFT_STORAGE_KEY,
  SITE_THEME_PRESETS,
  resolveSiteTheme,
  type BrandingDraft,
  type SiteThemeColors,
  type SiteThemeFonts,
  type SiteThemePresetId,
} from "@kenji-raffle/shared/site-theme";
import { GOOGLE_FONTS_CATALOG as FONT_CATALOG } from "@kenji-raffle/shared/google-fonts-catalog";
import { operatorUpload } from "@/lib/api";
import { ColorField } from "@/components/admin/ColorField";
import { SitePreviewFab, SitePreviewModal } from "@/components/admin/SitePreviewModal";

type BrandingEditorProps = {
  operatorName: string;
  logoUrl: string;
  footerLogoUrl: string;
  primaryColor: string;
  themePreset: SiteThemePresetId;
  themeColors: SiteThemeColors;
  themeFonts: SiteThemeFonts;
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
  onThemeFonts: (fonts: SiteThemeFonts) => void;
  onFooterLicence: (value: string) => void;
  onSocialFacebook: (value: string) => void;
  onSocialTwitter: (value: string) => void;
  onSocialInstagram: (value: string) => void;
  onLicenceNumber: (value: string) => void;
  onSupportEmail: (value: string) => void;
};

const COLOR_FIELDS: { key: keyof SiteThemeColors; label: string; gradient?: boolean }[] = [
  { key: "accent", label: "Brand accent" },
  { key: "headerBg", label: "Header background" },
  { key: "headerText", label: "Header text" },
  { key: "headerLink", label: "Header links (active)" },
  { key: "footerBg", label: "Footer background", gradient: true },
  { key: "footerText", label: "Footer text" },
  { key: "footerLink", label: "Footer links" },
  { key: "buttonBg", label: "Button background" },
  { key: "buttonText", label: "Button text" },
  { key: "linkColor", label: "Content links" },
  { key: "linkHover", label: "Content links (hover)" },
];

const FONT_FIELDS: { key: keyof SiteThemeFonts; label: string }[] = [
  { key: "body", label: "Normal text" },
  { key: "heading", label: "Headings" },
  { key: "nav", label: "Header navigation" },
  { key: "button", label: "Buttons" },
  { key: "link", label: "Hyperlinks" },
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

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FONT_CATALOG;
    return FONT_CATALOG.filter((f) => f.family.toLowerCase().includes(q));
  }, [query]);

  return (
    <label className="admin-font-field">
      {label}
      <input
        type="search"
        className="admin-font-field__search"
        placeholder="Search fonts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setQuery("")}
      />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((font) => (
          <option key={font.family} value={font.family}>
            {font.family}
          </option>
        ))}
      </select>
      <span className="admin-font-field__sample" style={{ fontFamily: `"${value}", sans-serif` }}>
        The quick brown fox jumps over the lazy dog
      </span>
    </label>
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
    themeFonts,
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
    onThemeFonts,
    onFooterLicence,
    onSocialFacebook,
    onSocialTwitter,
    onSocialInstagram,
    onLicenceNumber,
    onSupportEmail,
  } = props;

  const [previewOpen, setPreviewOpen] = useState(false);

  function applyPreset(preset: Exclude<SiteThemePresetId, "custom">) {
    const presetTheme = SITE_THEME_PRESETS[preset];
    const { label: _l, description: _d, ...colors } = presetTheme;
    const resolved = resolveSiteTheme({
      themePreset: preset,
      primaryColor: colors.accent,
      themeConfig: null,
    });
    onThemePreset(preset);
    onThemeColors(colors);
    onThemeFonts(resolved.fonts);
    onPrimaryColor(colors.accent);
  }

  function updateColor(key: keyof SiteThemeColors, value: string) {
    onThemePreset("custom");
    onThemeColors({ ...themeColors, [key]: value });
    if (key === "accent") onPrimaryColor(value);
  }

  function updateFont(key: keyof SiteThemeFonts, value: string) {
    onThemePreset("custom");
    onThemeFonts({ ...themeFonts, [key]: value });
  }

  const draft: BrandingDraft = useMemo(
    () => ({
      operatorName,
      logoUrl,
      footerLogoUrl,
      primaryColor,
      themePreset,
      themeColors,
      themeFonts,
      footerLicence,
      supportEmail,
      socialFacebook,
      socialTwitter,
      socialInstagram,
    }),
    [
      operatorName,
      logoUrl,
      footerLogoUrl,
      primaryColor,
      themePreset,
      themeColors,
      themeFonts,
      footerLicence,
      supportEmail,
      socialFacebook,
      socialTwitter,
      socialInstagram,
    ],
  );

  useEffect(() => {
    sessionStorage.setItem(BRANDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  return (
    <>
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
                    <span
                      style={{
                        background: preset.footerBg.includes("gradient")
                          ? preset.footerBg
                          : preset.footerBg,
                      }}
                    />
                  </span>
                  <span className="admin-theme-preset__label">{preset.label}</span>
                  <span className="admin-theme-preset__desc">{preset.description}</span>
                </button>
              );
            })}
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
          <h4 className="admin-branding__heading">Typography</h4>
          <p className="admin-panel__subtitle" style={{ marginTop: 0 }}>
            Choose Google Fonts for each text role on your public site.
          </p>
          <div className="admin-form-grid">
            {FONT_FIELDS.map(({ key, label }) => (
              <FontSelect
                key={key}
                label={label}
                value={themeFonts[key]}
                onChange={(v) => updateFont(key, v)}
              />
            ))}
          </div>
        </section>

        <section className="admin-branding__section">
          <h4 className="admin-branding__heading">Custom colours</h4>
          <p className="admin-panel__subtitle" style={{ marginTop: 0 }}>
            {themePreset === "custom"
              ? "You are using custom colours."
              : "Adjust any colour to switch to a custom theme."}
          </p>
          <div className="admin-color-grid">
            {COLOR_FIELDS.map(({ key, label, gradient }) => (
              <ColorField
                key={key}
                label={label}
                value={themeColors[key]}
                gradient={gradient}
                onChange={(v) => updateColor(key, v)}
              />
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

      <SitePreviewFab onClick={() => setPreviewOpen(true)} />
      <SitePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} draft={draft} />
    </>
  );
}
