"use client";

import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_FONTS,
  themeToCssVariables,
  type SiteThemeColors,
  type SiteThemeFonts,
} from "@kenji-raffle/shared/site-theme";
import type { SiteCopyOverrides } from "@kenji-raffle/shared/site-copy-defaults";
import { SiteFonts } from "@/components/SiteFonts";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMobileNav } from "@/components/SiteMobileNav";
import { ToastProvider } from "@/components/ToastProvider";
import { SiteCopyEditorProvider } from "@/components/site-copy/SiteCopyEditorProvider";
import { SiteCopyEditEntry } from "@/components/site-copy/SiteCopyEditEntry";
import { SiteCopyLoginBanner } from "@/components/site-copy/SiteCopyEditorShell";
import { useBrandingPreviewDraft } from "@/hooks/useBrandingPreviewDraft";
import { resolveDraftTheme } from "@/lib/branding-preview";
import { getOperatorToken } from "@/lib/api";
import { getAllSiteCopy } from "@/lib/site-copy";
import { isSiteCopyEditUrl } from "@/lib/site-copy-edit";

const SiteCopyEditorShell = dynamic(
  () => import("@/components/site-copy/SiteCopyEditorShell"),
  { ssr: false },
);

type TenantBranding = {
  name: string;
  content?: {
    copy?: SiteCopyOverrides | Record<string, string>;
  };
  branding?: {
    primary_color?: string;
    logo_url?: string | null;
    footer_logo_url?: string | null;
    footer_licence_text?: string | null;
    social_links?: Record<string, string>;
    support_email?: string | null;
    theme?: SiteThemeColors & { preset?: string; fonts?: SiteThemeFonts };
  };
};

export function PublicSiteChrome({
  tenant,
  children,
}: {
  tenant: TenantBranding | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const previewDraft = useBrandingPreviewDraft();
  const isAdmin = pathname.startsWith("/admin");
  const isAuth =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const copyEditRequested = isSiteCopyEditUrl(searchParams);
  const [hasOperatorToken, setHasOperatorToken] = useState(false);

  useEffect(() => {
    const sync = () => setHasOperatorToken(Boolean(getOperatorToken()));
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  const copyEditActive = copyEditRequested && hasOperatorToken;

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!tenant) {
    return <div className="site-unknown-tenant">{children}</div>;
  }

  const previewTheme = previewDraft ? resolveDraftTheme(previewDraft) : null;
  const theme = previewTheme ?? tenant.branding?.theme;
  const fonts = theme?.fonts ?? DEFAULT_SITE_FONTS;
  const cssVars = theme
    ? themeToCssVariables(theme, fonts)
    : themeToCssVariables(
        {
          accent: tenant.branding?.primary_color ?? "#00a551",
          headerBg: "#ffffff",
          headerText: "#0f172a",
          headerLink: "#007a3d",
          footerBg: "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)",
          footerText: "#94a3b8",
          footerLink: "#cbd5e1",
          buttonBg: tenant.branding?.primary_color ?? "#00a551",
          buttonText: "#ffffff",
          linkColor: "#007a3d",
          linkHover: tenant.branding?.primary_color ?? "#00a551",
        },
        fonts,
      );

  const tenantName = previewDraft?.operatorName ?? tenant.name;
  const logoUrl = previewDraft?.logoUrl || tenant.branding?.logo_url;
  const footerLogoUrl = previewDraft?.footerLogoUrl || tenant.branding?.footer_logo_url;
  const footerLicence =
    previewDraft?.footerLicence || tenant.branding?.footer_licence_text;
  const supportEmail = previewDraft?.supportEmail || tenant.branding?.support_email;
  const socialLinks: Record<string, string> = previewDraft
    ? Object.fromEntries(
        Object.entries({
          facebook: previewDraft.socialFacebook,
          twitter: previewDraft.socialTwitter,
          instagram: previewDraft.socialInstagram,
        }).filter(([, url]) => Boolean(url)),
      ) as Record<string, string>
    : (tenant.branding?.social_links ?? {});

  const isHome = pathname === "/";
  const copyOverrides = (tenant.content?.copy ?? {}) as SiteCopyOverrides;
  const copyVars = { tenantName };
  const siteCopy = getAllSiteCopy(tenant, copyVars);

  const rootClass = [
    "site-root site-root--commerce",
    previewDraft ? "site-root--preview" : "",
    copyEditRequested ? "site-root--copy-edit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ToastProvider>
      <SiteCopyEditorProvider
        active={copyEditActive}
        initialOverrides={copyOverrides}
        vars={copyVars}
      >
        <SiteFonts fonts={fonts} />
        <div className={rootClass} style={cssVars as React.CSSProperties}>
          {previewDraft && (
            <div className="site-preview-banner" role="status">
              Preview mode — unsaved branding changes
            </div>
          )}
          {copyEditRequested && !hasOperatorToken && <SiteCopyLoginBanner />}
          {hasOperatorToken && !copyEditActive && !previewDraft && <SiteCopyEditEntry />}
          {copyEditActive && <SiteCopyEditorShell />}
          <SiteHeader tenantName={tenantName} logoUrl={logoUrl} siteCopy={siteCopy} />
          <div
            className={`site-main${isAuth ? " site-main--auth" : ""}${isHome ? " site-main--home" : " site-container"}${!isAuth ? " site-main--with-mobile-nav" : ""}${copyEditActive ? " site-main--copy-edit" : ""}`}
          >
            {children}
          </div>
          <SiteFooter
            name={tenantName}
            footerLogoUrl={footerLogoUrl}
            footerLicence={footerLicence}
            socialLinks={socialLinks}
            supportEmail={supportEmail}
            siteCopy={siteCopy}
          />
          {!isAuth && <SiteMobileNav />}
        </div>
      </SiteCopyEditorProvider>
    </ToastProvider>
  );
}
