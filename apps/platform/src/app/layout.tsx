import type { Metadata } from "next";
import "./globals.css";
import { PlatformAuthBootstrap } from "../components/PlatformAuthBootstrap";

export const metadata: Metadata = {
  title: "Raffle Platform Console",
  description: "Multi-tenant raffle platform administration",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PlatformAuthBootstrap />
        {children}
      </body>
    </html>
  );
}
