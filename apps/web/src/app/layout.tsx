import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getRequestHost, getTenantContext } from "@/lib/tenant";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";

export const metadata: Metadata = {
  title: "Raffle Site",
  description: "Operator raffle website",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const accent = tenant?.branding?.primary_color ?? "#00a551";

  return (
    <html lang="en">
      <body>
        <AnalyticsScripts analytics={tenant?.analytics ?? null} />
        <PublicSiteChrome tenant={tenant} accent={accent}>
          {children}
        </PublicSiteChrome>
      </body>
    </html>
  );
}
