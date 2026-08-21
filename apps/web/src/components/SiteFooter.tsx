import Link from "next/link";

type FooterProps = {
  name: string;
  accent?: string;
  footerLicence?: string | null;
  socialLinks?: Record<string, string>;
};

export function SiteFooter({
  name,
  accent = "#00a551",
  footerLicence,
  socialLinks = {},
}: FooterProps) {
  const social = Object.entries(socialLinks).filter(([, url]) => url);

  return (
    <footer
      style={{
        marginTop: 48,
        padding: "24px 20px",
        borderTop: "1px solid #e2e8f0",
        maxWidth: 960,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {footerLicence && <p className="muted">{footerLicence}</p>}
      <nav style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
        <Link href="/faq">FAQ</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/play-safe">Play Safe</Link>
        <Link href="/winners">Winners</Link>
        <Link href="/account">My account</Link>
      </nav>
      {social.length > 0 && (
        <p style={{ marginTop: 12 }}>
          {social.map(([label, url]) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: 12, color: accent }}
            >
              {label}
            </a>
          ))}
        </p>
      )}
      <p className="muted" style={{ marginTop: 12 }}>
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}
