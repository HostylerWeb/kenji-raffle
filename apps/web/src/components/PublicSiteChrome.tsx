"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SitePublicNav } from "@/components/SitePublicNav";

type TenantBranding = {
  name: string;
  branding?: {
    primary_color?: string;
    logo_url?: string;
    footer_licence_text?: string;
    social_links?: Record<string, string>;
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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {tenant?.branding?.logo_url && (
        <div className="site-logo-bar">
          <img src={tenant.branding.logo_url} alt={tenant.name} />
        </div>
      )}
      <SitePublicNav accent={accent} />
      {children}
      {tenant && (
        <SiteFooter
          name={tenant.name}
          accent={accent}
          footerLicence={tenant.branding?.footer_licence_text}
          socialLinks={tenant.branding?.social_links ?? {}}
        />
      )}
    </>
  );
}
