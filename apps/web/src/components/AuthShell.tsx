import Image from "next/image";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";

export function AuthShell({
  title,
  subtitle,
  children,
  logoUrl,
  tenantName,
  titleCopyKey,
  subtitleCopyKey,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  logoUrl?: string | null;
  tenantName?: string;
  titleCopyKey?: SiteCopyKey;
  subtitleCopyKey?: SiteCopyKey;
}) {
  return (
    <div className="site-auth site-auth--commerce">
      <aside className="site-auth__hero">
        {logoUrl && tenantName && (
          <Image
            src={logoUrl}
            alt={tenantName}
            width={140}
            height={48}
            className="site-auth__logo"
          />
        )}
        <p className="site-auth__kicker">Licensed raffles · 18+ only</p>
        <h1>Win prizes you&apos;ll love</h1>
        <p>
          Secure checkout, instant wins, and full Play Safe controls. Enter competitions
          from your phone or desktop in minutes.
        </p>
        <ul className="site-auth__bullets">
          <li>Instant win prizes</li>
          <li>Secure gateway payments</li>
          <li>Play Safe spending controls</li>
        </ul>
      </aside>
      <main className="site-auth__panel">
        <div className="site-auth__form">
          <h2>
            {titleCopyKey ? (
              <SiteCopySlot copyKey={titleCopyKey}>{title}</SiteCopySlot>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="site-muted site-auth__subtitle">
              {subtitleCopyKey ? (
                <SiteCopySlot copyKey={subtitleCopyKey}>{subtitle}</SiteCopySlot>
              ) : (
                subtitle
              )}
            </p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
