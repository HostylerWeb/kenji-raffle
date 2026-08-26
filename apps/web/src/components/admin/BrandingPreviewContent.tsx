"use client";

import {
  resolveSiteTheme,
  themeToCssVariables,
  type BrandingDraft,
  type SiteThemeFonts,
} from "@kenji-raffle/shared/site-theme";
import { SiteFonts } from "@/components/SiteFonts";
import { formatKes } from "@/lib/format";

type PreviewPage = "home" | "raffle" | "cart";

const MOCK_RAFFLE = {
  title: "Win a brand new SUV",
  price: 250,
  soldPct: 68,
  available: 3200,
  endLabel: "2 days left",
};

function PreviewHome({ operatorName }: { operatorName: string }) {
  return (
    <>
      <section className="site-hero site-hero--v2">
        <div className="site-hero__overlay" />
        <div className="site-hero__content">
          <p className="site-hero__kicker">Featured at {operatorName}</p>
          <h1 className="site-hero__title">{MOCK_RAFFLE.title}</h1>
          <p className="site-hero__desc">
            From {formatKes(MOCK_RAFFLE.price)} per ticket — secure checkout and instant wins.
          </p>
          <div className="site-hero__actions">
            <span className="site-btn site-btn--primary site-btn--lg">Enter now</span>
            <span className="site-btn site-btn--secondary site-btn--lg site-btn--ghost-light">
              All raffles
            </span>
          </div>
        </div>
      </section>

      <div className="site-stats-strip">
        <div className="site-stats-strip__item">
          <span className="site-stats-strip__value">12+</span>
          <span className="site-stats-strip__label">Live raffles</span>
        </div>
        <div className="site-stats-strip__item">
          <span className="site-stats-strip__value">50K+</span>
          <span className="site-stats-strip__label">Tickets sold</span>
        </div>
        <div className="site-stats-strip__item">
          <span className="site-stats-strip__value">KES 2M+</span>
          <span className="site-stats-strip__label">In prizes</span>
        </div>
      </div>

      <section className="site-section">
        <h2 className="site-section-title">Featured raffles</h2>
        <div className="site-raffle-grid site-raffle-grid--preview">
          {[1, 2, 3].map((i) => (
            <div key={i} className="site-raffle-card site-raffle-card--v2">
              <div className="site-raffle-card__media">
                <div className="site-raffle-card__placeholder">P</div>
                <span className="site-raffle-card__badge site-raffle-card__badge--featured">
                  Featured
                </span>
              </div>
              <div className="site-raffle-card__body">
                <h3 className="site-raffle-card__title">Premium prize #{i}</h3>
                <span className="site-raffle-card__price">{formatKes(150 + i * 50)}</span>
                <div className="site-progress">
                  <div className="site-progress__bar" style={{ width: `${40 + i * 15}%` }} />
                </div>
                <span className="site-raffle-card__cta">Enter now →</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PreviewRaffleDetail() {
  return (
    <div className="site-detail-grid site-detail-grid--preview">
      <div className="site-detail-gallery-preview">
        <div className="site-raffle-card__placeholder" style={{ height: 280, borderRadius: 16 }}>
          Prize image
        </div>
      </div>
      <aside className="site-detail-buy">
        <div className="site-card site-card--highlight site-card--v2">
          <h1 className="site-page-title">{MOCK_RAFFLE.title}</h1>
          <p className="site-detail-price">
            {formatKes(MOCK_RAFFLE.price)}
            <span> per ticket</span>
          </p>
          <div className="site-progress" style={{ marginBottom: 16 }}>
            <div className="site-progress__bar" style={{ width: `${MOCK_RAFFLE.soldPct}%` }} />
          </div>
          <p className="site-muted">{MOCK_RAFFLE.available.toLocaleString()} tickets left</p>
          <span className="site-btn site-btn--primary site-btn--block" style={{ marginTop: 16 }}>
            Add to cart
          </span>
        </div>
      </aside>
    </div>
  );
}

function PreviewCart() {
  return (
    <div className="site-cart-preview">
      <h1 className="site-page-title">Your cart</h1>
      <div className="site-card site-card--v2" style={{ marginTop: 20 }}>
        <div className="site-cart-preview__row">
          <div>
            <strong>{MOCK_RAFFLE.title}</strong>
            <p className="site-muted">5 tickets · {formatKes(MOCK_RAFFLE.price * 5)}</p>
          </div>
          <span className="site-btn site-btn--secondary site-btn--sm">Remove</span>
        </div>
      </div>
      <div className="site-card site-card--v2 site-card--highlight" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span>Total</span>
          <strong>{formatKes(MOCK_RAFFLE.price * 5)}</strong>
        </div>
        <span className="site-btn site-btn--primary site-btn--block">Proceed to checkout</span>
      </div>
    </div>
  );
}

export function BrandingPreviewContent({
  draft,
  page,
}: {
  draft: BrandingDraft;
  page: PreviewPage;
}) {
  const theme = resolveSiteTheme({
    themePreset: draft.themePreset,
    primaryColor: draft.primaryColor,
    themeConfig: {
      ...draft.themeColors,
      fonts: draft.themeFonts,
    },
  });
  const cssVars = themeToCssVariables(theme, theme.fonts);

  return (
    <div className="branding-preview-root site-root" style={cssVars as React.CSSProperties}>
      <SiteFonts fonts={theme.fonts} />
      <header className="site-header site-header--v2">
        <div className="site-container site-header__inner">
          <div className="site-brand">
            {draft.logoUrl ? (
              <img src={draft.logoUrl} alt="" className="site-brand__logo" />
            ) : (
              <span className="site-brand__mark">{draft.operatorName.charAt(0)}</span>
            )}
            <span className="site-brand__text">
              <span className="site-brand__name">{draft.operatorName}</span>
              <span className="site-brand__tag">Licensed raffles</span>
            </span>
          </div>
          <nav className="site-nav" aria-hidden>
            <span className="site-nav-link site-nav-link--active">Raffles</span>
            <span className="site-nav-link">Winners</span>
          </nav>
          <span className="site-btn site-btn--primary site-btn--sm">Register</span>
        </div>
      </header>
      <main className="site-main site-container">
        {page === "home" && <PreviewHome operatorName={draft.operatorName} />}
        {page === "raffle" && <PreviewRaffleDetail />}
        {page === "cart" && <PreviewCart />}
      </main>
      <footer className="site-footer site-footer--v2">
        <div className="site-footer__accent" aria-hidden />
        <div className="site-container">
          <div className="site-footer__grid">
            <div className="site-footer__brand-col">
              {draft.footerLogoUrl ? (
                <img src={draft.footerLogoUrl} alt="" className="site-footer__logo" />
              ) : (
                <p className="site-footer__brand">{draft.operatorName}</p>
              )}
              <p className="site-footer__desc">
                {draft.footerLicence || "Licensed raffle operator. Play responsibly."}
              </p>
            </div>
            <div className="site-footer__links-col">
              <p className="site-footer__heading">Explore</p>
              <ul className="site-footer__links">
                <li><span>All raffles</span></li>
                <li><span>Winners</span></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
