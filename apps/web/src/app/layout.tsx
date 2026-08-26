import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import "./public.css";
import { getRequestHost, getTenantContext } from "@/lib/tenant";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  return {
    title: tenant ? `${tenant.name} — Raffles` : "Raffle Site",
    description: tenant
      ? `Enter licensed raffles at ${tenant.name}. Secure checkout, instant wins, Play Safe.`
      : "Operator raffle website",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  return (
    <html lang="en">
      <head />
      <body>
        <AnalyticsScripts analytics={tenant?.analytics ?? null} />
        <Suspense fallback={<div className="site-root">{children}</div>}>
          <PublicSiteChrome tenant={tenant}>
            {children}
          </PublicSiteChrome>
        </Suspense>
      </body>
    </html>
  );
}
