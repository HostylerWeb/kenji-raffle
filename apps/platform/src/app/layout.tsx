import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlatformAuthBootstrap } from "../components/PlatformAuthBootstrap";

export const metadata: Metadata = {
  title: "Kenji Raffle — Platform Console",
  description: "Multi-tenant raffle platform administration",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a7a3d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PlatformAuthBootstrap />
        {children}
      </body>
    </html>
  );
}
