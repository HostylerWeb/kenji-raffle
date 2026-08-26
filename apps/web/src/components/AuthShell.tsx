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
    <div className="site-auth">
      <aside className="site-auth__hero">
        {logoUrl && tenantName && (
          <Image
            src={logoUrl}
            alt={tenantName}
            width={120}
            height={40}
            style={{ objectFit: "contain", marginBottom: 24 }}
          />
        )}
        <h1>Win prizes you&apos;ll love</h1>
        <p>
          Licensed raffles with secure checkout, instant wins, and full
          Play Safe controls. Must be 18+ to enter.
        </p>
      </aside>
      <main className="site-auth__panel">
        <div className="site-auth__form">
          <h2>{title}</h2>
          {subtitle && <p className="site-muted" style={{ marginBottom: 24 }}>{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
