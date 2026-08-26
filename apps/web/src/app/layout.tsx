import type { Metadata, Viewport } from "next";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          as="style"
        />
      </head>
      <body>
        <AnalyticsScripts analytics={tenant?.analytics ?? null} />
        <PublicSiteChrome tenant={tenant}>
          {children}
        </PublicSiteChrome>
      </body>
    </html>
  );
}
