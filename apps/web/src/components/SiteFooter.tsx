import Link from "next/link";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { ProtectedAccountLink } from "@/components/ProtectedAccountLink";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";

type FooterProps = {
  name: string;
  footerLogoUrl?: string | null;
  footerLicence?: string | null;
  socialLinks?: Record<string, string>;
  supportEmail?: string | null;
  siteCopy: Record<SiteCopyKey, string>;
};

export function SiteFooter({
  name,
  footerLogoUrl,
  footerLicence,
  socialLinks = {},
  supportEmail,
  siteCopy,
}: FooterProps) {
  const social = Object.entries(socialLinks).filter(([, url]) => url);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer site-footer--v2">
      <div className="site-footer__accent" aria-hidden />
      <div className="site-container">
        <div className="site-footer__trust">
          <span className="site-footer__badge">
            <SiteCopySlot copyKey="footer.badge_18">{siteCopy["footer.badge_18"]}</SiteCopySlot>
          </span>
          <span className="site-footer__badge">
            <SiteCopySlot copyKey="footer.badge_licensed">
              {siteCopy["footer.badge_licensed"]}
            </SiteCopySlot>
          </span>
          <span className="site-footer__badge">
            <SiteCopySlot copyKey="footer.badge_responsible">
              {siteCopy["footer.badge_responsible"]}
            </SiteCopySlot>
          </span>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand-col">
            {footerLogoUrl ? (
              <img src={footerLogoUrl} alt={name} className="site-footer__logo" />
            ) : (
              <p className="site-footer__brand">{name}</p>
            )}
            <p className="site-footer__desc">
              {footerLicence ??
                "Licensed raffle operator. Fair draws, secure payments, and tools to help you play responsibly."}
            </p>
            {supportEmail && (
              <p className="site-footer__support">
                <span className="site-footer__support-label">
                  <SiteCopySlot copyKey="footer.support_label">
                    {siteCopy["footer.support_label"]}
                  </SiteCopySlot>
                </span>
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
            <p className="site-footer__heading">
              <SiteCopySlot copyKey="footer.explore_heading">
                {siteCopy["footer.explore_heading"]}
              </SiteCopySlot>
            </p>
            <ul className="site-footer__links">
              <li><Link href="/raffles">All raffles</Link></li>
              <li><Link href="/winners">Winners</Link></li>
              <li><Link href="/play-safe">Play Safe</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="site-footer__links-col">
            <p className="site-footer__heading">
              <SiteCopySlot copyKey="footer.account_heading">
                {siteCopy["footer.account_heading"]}
              </SiteCopySlot>
            </p>
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
          <span className="site-footer__age">
            <SiteCopySlot copyKey="footer.age_notice">{siteCopy["footer.age_notice"]}</SiteCopySlot>
          </span>
        </div>
      </div>
    </footer>
  );
}
