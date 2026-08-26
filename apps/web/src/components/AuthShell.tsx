import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
  logoUrl,
  tenantName,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  logoUrl?: string | null;
  tenantName?: string;
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
          <h2>{title}</h2>
          {subtitle && <p className="site-muted site-auth__subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
