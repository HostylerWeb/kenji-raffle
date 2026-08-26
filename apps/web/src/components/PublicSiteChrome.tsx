"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMobileNav } from "@/components/SiteMobileNav";
import { ToastProvider } from "@/components/ToastProvider";

type TenantBranding = {
  name: string;
  branding?: {
    primary_color?: string;
    logo_url?: string;
    footer_licence_text?: string;
    social_links?: Record<string, string>;
    support_email?: string | null;
  };
};

export function PublicSiteChrome({
  tenant,
  accent,
  children,
}: {
  tenant: TenantBranding | null;
  accent: string;
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

  return (
    <ToastProvider>
      <div
        className="site-root"
        style={{ ["--tenant-accent" as string]: accent }}
      >
        <SiteHeader
          tenantName={tenant?.name ?? "Raffle"}
          logoUrl={tenant?.branding?.logo_url}
          accent={accent}
        />
        <div className={`site-main site-container${isAuth ? "" : " site-main--with-mobile-nav"}`}>
          {children}
        </div>
        {tenant && (
          <SiteFooter
            name={tenant.name}
            footerLicence={tenant.branding?.footer_licence_text}
            socialLinks={tenant.branding?.social_links ?? {}}
            supportEmail={tenant.branding?.support_email}
          />
        )}
        {!isAuth && <SiteMobileNav />}
      </div>
    </ToastProvider>
  );
}
