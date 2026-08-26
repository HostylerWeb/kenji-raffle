import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-empty" style={{ marginTop: 40 }}>
      <h1 className="site-page-title">Page not found</h1>
      <p className="site-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="site-btn site-btn--primary" style={{ marginTop: 16 }}>
        Back to home
      </Link>
    </div>
  );
}
