"use client";

import { usePathname } from "next/navigation";
import { themeToCssVariables, type SiteThemeColors } from "@kenji-raffle/shared/site-theme";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMobileNav } from "@/components/SiteMobileNav";
import { ToastProvider } from "@/components/ToastProvider";

type TenantBranding = {
  name: string;
  branding?: {
    primary_color?: string;
    logo_url?: string | null;
    footer_logo_url?: string | null;
    footer_licence_text?: string | null;
    social_links?: Record<string, string>;
    support_email?: string | null;
    theme?: SiteThemeColors & { preset?: string };
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

  const theme = tenant.branding?.theme;
  const cssVars = theme
    ? themeToCssVariables(theme)
    : themeToCssVariables({
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
      });

  return (
    <ToastProvider>
      <div className="site-root" style={cssVars as React.CSSProperties}>
        <SiteHeader
          tenantName={tenant.name}
          logoUrl={tenant.branding?.logo_url}
        />
        <div className={`site-main site-container${isAuth ? "" : " site-main--with-mobile-nav"}`}>
          {children}
        </div>
        <SiteFooter
          name={tenant.name}
          footerLogoUrl={tenant.branding?.footer_logo_url}
          footerLicence={tenant.branding?.footer_licence_text}
          socialLinks={tenant.branding?.social_links ?? {}}
          supportEmail={tenant.branding?.support_email}
        />
        {!isAuth && <SiteMobileNav />}
      </div>
    </ToastProvider>
  );
}
