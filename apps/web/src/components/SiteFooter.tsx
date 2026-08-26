import Link from "next/link";
import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";

type FooterProps = {
  name: string;
  footerLicence?: string | null;
  socialLinks?: Record<string, string>;
  supportEmail?: string | null;
};

export function SiteFooter({
  name,
  footerLicence,
  socialLinks = {},
  supportEmail,
}: FooterProps) {
  const social = Object.entries(socialLinks).filter(([, url]) => url);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden />
      <div className="site-container">
        <div className="site-footer__trust">
          <span className="site-footer__badge">18+ only</span>
          <span className="site-footer__badge">Licensed operator</span>
          <span className="site-footer__badge">Play responsibly</span>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand-col">
            <p className="site-footer__brand">{name}</p>
            <p className="site-footer__desc">
              {footerLicence ??
                "Licensed raffle operator. Fair draws, secure payments, and tools to help you play responsibly."}
            </p>
            {supportEmail && (
              <p className="site-footer__support">
                <span className="site-footer__support-label">Support</span>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </p>
            )}
            {social.length > 0 && (
              <div className="site-footer__social">
                {social.map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__social-link"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="site-footer__links-col">
            <p className="site-footer__heading">Explore</p>
            <ul className="site-footer__links">
              <li><Link href="/raffles">All raffles</Link></li>
              <li><Link href="/winners">Winners</Link></li>
              <li><Link href="/play-safe">Play Safe</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="site-footer__links-col">
            <p className="site-footer__heading">Account & legal</p>
            <ul className="site-footer__links">
              <li>
                <ProtectedAccountLink href="/account">My account</ProtectedAccountLink>
              </li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/cart">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {year} {name}. All rights reserved.</span>
          <span className="site-footer__age">Must be 18+ to enter</span>
        </div>
      </div>
    </footer>
  );
}
