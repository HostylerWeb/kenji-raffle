export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-hero" aria-hidden={false}>
        <div className="auth-hero-content">
          <p className="auth-hero-kicker">Kenji Raffle</p>
          <h1>Platform control plane</h1>
          <p>
            Provision operators, monitor compliance, and keep every raffle site
            healthy from one secure console.
          </p>
        </div>
        <ul className="auth-hero-features">
          <li>
            <span className="auth-feature-dot" />
            Multi-tenant operator provisioning
          </li>
          <li>
            <span className="auth-feature-dot" />
            GRA tax relay &amp; audit visibility
          </li>
          <li>
            <span className="auth-feature-dot" />
            Real-time health &amp; reporting
          </li>
        </ul>
      </aside>
      <main className="auth-panel">
        <div className="auth-form-wrap">
          <h2>{title}</h2>
          <p className="auth-subtitle muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
