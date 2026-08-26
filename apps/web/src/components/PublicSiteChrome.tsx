"use client";

import { usePathname } from "next/navigation";
import {
  DEFAULT_SITE_FONTS,
  themeToCssVariables,
  type SiteThemeColors,
  type SiteThemeFonts,
} from "@kenji-raffle/shared/site-theme";
import { SiteFonts } from "@/components/SiteFonts";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMobileNav } from "@/components/SiteMobileNav";
import { ToastProvider } from "@/components/ToastProvider";
import { useBrandingPreviewDraft } from "@/hooks/useBrandingPreviewDraft";
import { resolveDraftTheme } from "@/lib/branding-preview";

type TenantBranding = {
  name: string;
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
  const previewDraft = useBrandingPreviewDraft();
  const isAdmin = pathname.startsWith("/admin");
  const isAuth =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

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

  return (
    <ToastProvider>
      <SiteFonts fonts={fonts} />
      <div
        className={`site-root site-root--commerce${previewDraft ? " site-root--preview" : ""}`}
        style={cssVars as React.CSSProperties}
      >
        {previewDraft && (
          <div className="site-preview-banner" role="status">
            Preview mode — unsaved branding changes
          </div>
        )}
        <SiteHeader tenantName={tenantName} logoUrl={logoUrl} />
        <div
          className={`site-main${isAuth ? " site-main--auth" : ""}${isHome ? " site-main--home" : " site-container"}${!isAuth ? " site-main--with-mobile-nav" : ""}`}
        >
          {children}
        </div>
        <SiteFooter
          name={tenantName}
          footerLogoUrl={footerLogoUrl}
          footerLicence={footerLicence}
          socialLinks={socialLinks}
          supportEmail={supportEmail}
        />
        {!isAuth && <SiteMobileNav />}
      </div>
    </ToastProvider>
  );
}
