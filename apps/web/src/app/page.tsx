import Link from "next/link";
import { headers } from "next/headers";
import { HomeLiveCatalog } from "@/components/HomeLiveCatalog";
import { FeaturedHeroRail } from "@/components/FeaturedHeroRail";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";
import { RaffleRail } from "@/components/RaffleRail";
import { SiteStatsStrip } from "@/components/SiteStatsStrip";
import { SiteCopySlot } from "@/components/site-copy/SiteCopySlot";
import { pickHeroRaffles, planHomeSections } from "@/lib/raffle-display";
import { getSiteCopy } from "@/lib/site-copy";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";

type Category = { id: string; name: string; slug: string };

const CATALOG_LIMIT = 12;

function endingSoonRaffles(raffles: RaffleCardData[]): RaffleCardData[] {
  const cutoff = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return raffles
    .filter((r) => {
      if (!r.end_date || r.tickets_available === 0) return false;
      const end = new Date(r.end_date).getTime();
      return end > Date.now() && end < cutoff;
    })
    .slice(0, 12);
}

export default async function HomePage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  if (!tenant) {
    return (
      <div className="site-unknown-tenant__panel">
        <h1 className="site-unknown-tenant__title">Site not found</h1>
        <p className="site-unknown-tenant__text">
          No operator is registered for this address. Check the URL or contact the
          platform team.
        </p>
      </div>
    );
  }

  let featured: RaffleCardData[] = [];
  let allRaffles: RaffleCardData[] = [];
  let categories: Category[] = [];
  let recentWinners: {
    raffle_title: string;
    winner_name: string;
    prize_name: string | null;
  }[] = [];

  let loadError = false;

  try {
    featured = await publicFetch<RaffleCardData[]>("/v1/raffles?featured=true", host);
    allRaffles = await publicFetch<RaffleCardData[]>("/v1/raffles", host);
    categories = await publicFetch<Category[]>("/v1/categories", host);
    recentWinners = await publicFetch<
      { raffle_title: string; winner_name: string; prize_name: string | null }[]
    >("/v1/winners", host);
  } catch {
    loadError = true;
  }

  const liveRaffles = allRaffles;
  const endingSoon = endingSoonRaffles(liveRaffles);
  const heroRaffles = pickHeroRaffles(liveRaffles, featured, endingSoon);
  const sections = planHomeSections(liveRaffles, featured, endingSoon, heroRaffles);

  const totalTicketsSold = liveRaffles.reduce((sum, r) => {
    const total = r.max_entries ?? 0;
    const available = r.tickets_available ?? 0;
    return sum + Math.max(0, total - available);
  }, 0);

  const copyVars = { tenantName: tenant.name, liveCount: liveRaffles.length };
  const heroCopy = {
    "home.hero.kicker": getSiteCopy(tenant, "home.hero.kicker", copyVars),
    "home.hero.headline": getSiteCopy(tenant, "home.hero.headline", copyVars),
    "home.hero.sub": getSiteCopy(tenant, "home.hero.sub", copyVars),
  };

  return (
    <>
      {loadError && (
        <div className="site-banner site-banner--warning site-container" role="alert">
          Some content could not be loaded. Please refresh the page or try again shortly.
        </div>
      )}

      <FeaturedHeroRail
        raffles={heroRaffles}
        tenantName={tenant.name}
        showFooterLink={false}
        copy={heroCopy}
      />

      <div className="site-trust-strip site-trust-strip--merged site-container" aria-label="Trust indicators">
        <SiteCopySlot copyKey="home.trust.lead" className="site-trust-strip__lead">
          {getSiteCopy(tenant, "home.trust.lead", copyVars)}
        </SiteCopySlot>
        <span className="site-trust-strip__divider" aria-hidden>
          ·
        </span>
        <SiteCopySlot copyKey="home.trust.item1">
          {getSiteCopy(tenant, "home.trust.item1", copyVars)}
        </SiteCopySlot>
        <SiteCopySlot copyKey="home.trust.item2">
          {getSiteCopy(tenant, "home.trust.item2", copyVars)}
        </SiteCopySlot>
        <SiteCopySlot copyKey="home.trust.item3">
          {getSiteCopy(tenant, "home.trust.item3", copyVars)}
        </SiteCopySlot>
      </div>

      {liveRaffles.length === 0 ? (
        <section className="site-section site-container">
          <div className="site-empty site-empty--commerce">
            <SiteCopySlot copyKey="home.empty.title" as="h3" className="site-empty__title">
              {getSiteCopy(tenant, "home.empty.title", copyVars)}
            </SiteCopySlot>
            <SiteCopySlot copyKey="home.empty.body" as="p" className="site-muted">
              {getSiteCopy(tenant, "home.empty.body", copyVars)}
            </SiteCopySlot>
            <Link href="/contact" className="site-btn site-btn--secondary site-btn--sm">
              <SiteCopySlot copyKey="home.empty.cta">
                {getSiteCopy(tenant, "home.empty.cta", copyVars)}
              </SiteCopySlot>
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="site-section site-section--catalog site-container">
            <div className="site-section-header">
              <div>
                <SiteCopySlot
                  copyKey="home.live.title"
                  as="h2"
                  className="site-section-title site-section-title--lg"
                >
                  {getSiteCopy(tenant, "home.live.title", copyVars)}
                </SiteCopySlot>
                <SiteCopySlot
                  copyKey="home.live.lead"
                  as="p"
                  className="site-lead site-section-header__lead"
                >
                  {getSiteCopy(tenant, "home.live.lead", copyVars)}
                </SiteCopySlot>
              </div>
              <Link href="/raffles" className="site-rail-section__link">
                <SiteCopySlot copyKey="home.live.view_all_link">
                  {getSiteCopy(tenant, "home.live.view_all_link", copyVars)}
                </SiteCopySlot>
              </Link>
            </div>

            <HomeLiveCatalog
              raffles={liveRaffles}
              categories={categories}
              limit={CATALOG_LIMIT}
            />

            {liveRaffles.length > CATALOG_LIMIT && (
              <div className="site-catalog-more">
                <Link href="/raffles" className="site-btn site-btn--secondary">
                  <SiteCopySlot copyKey="home.live.view_all_btn">
                    {getSiteCopy(tenant, "home.live.view_all_btn", copyVars)}
                  </SiteCopySlot>
                </Link>
              </div>
            )}
          </section>

          {sections.showEndingSoonRail && (
            <RaffleRail
              title="Ending soon"
              raffles={sections.endingSoonRail}
              viewAllHref="/raffles?ending_soon=true"
            />
          )}

          {sections.showGrid && (
            <section className="site-section site-container">
              <div className="site-section-header">
                <h2 className="site-section-title site-section-title--lg">{sections.gridTitle}</h2>
                <Link href="/raffles" className="site-rail-section__link">
                  <SiteCopySlot copyKey="home.live.view_all_link">
                    {getSiteCopy(tenant, "home.live.view_all_link", copyVars)}
                  </SiteCopySlot>
                </Link>
              </div>
              <div className="site-raffle-grid site-raffle-grid--commerce">
                {sections.gridRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id} raffle={raffle} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="site-home-dark">
        {liveRaffles.length > 0 && (
          <div className="site-stats-band site-stats-band--home">
            <div className="site-container">
              <SiteStatsStrip
                liveRaffles={liveRaffles.length}
                ticketsSold={totalTicketsSold > 0 ? totalTicketsSold : undefined}
              />
            </div>
          </div>
        )}

        <section className="site-section site-section--dark site-section--flush">
          <div className="site-container">
            <SiteCopySlot
              copyKey="home.steps.title"
              as="h2"
              className="site-section-title site-section-title--lg site-section-title--light"
            >
              {getSiteCopy(tenant, "home.steps.title", copyVars)}
            </SiteCopySlot>
            <div className="site-steps site-steps--commerce">
              <div className="site-step site-step--commerce">
                <div className="site-step__num">1</div>
                <SiteCopySlot copyKey="home.steps.1.title" as="p" className="site-step__title">
                  {getSiteCopy(tenant, "home.steps.1.title", copyVars)}
                </SiteCopySlot>
                <SiteCopySlot copyKey="home.steps.1.desc" as="p" className="site-step__desc">
                  {getSiteCopy(tenant, "home.steps.1.desc", copyVars)}
                </SiteCopySlot>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">2</div>
                <SiteCopySlot copyKey="home.steps.2.title" as="p" className="site-step__title">
                  {getSiteCopy(tenant, "home.steps.2.title", copyVars)}
                </SiteCopySlot>
                <SiteCopySlot copyKey="home.steps.2.desc" as="p" className="site-step__desc">
                  {getSiteCopy(tenant, "home.steps.2.desc", copyVars)}
                </SiteCopySlot>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">3</div>
                <SiteCopySlot copyKey="home.steps.3.title" as="p" className="site-step__title">
                  {getSiteCopy(tenant, "home.steps.3.title", copyVars)}
                </SiteCopySlot>
                <SiteCopySlot copyKey="home.steps.3.desc" as="p" className="site-step__desc">
                  {getSiteCopy(tenant, "home.steps.3.desc", copyVars)}
                </SiteCopySlot>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">4</div>
                <SiteCopySlot copyKey="home.steps.4.title" as="p" className="site-step__title">
                  {getSiteCopy(tenant, "home.steps.4.title", copyVars)}
                </SiteCopySlot>
                <SiteCopySlot copyKey="home.steps.4.desc" as="p" className="site-step__desc">
                  {getSiteCopy(tenant, "home.steps.4.desc", copyVars)}
                </SiteCopySlot>
              </div>
            </div>
          </div>
        </section>
      </div>

      {recentWinners.length > 0 && (
        <section className="site-section site-section--winners site-container">
          <div className="site-section-header">
            <SiteCopySlot
              copyKey="home.winners.title"
              as="h2"
              className="site-section-title site-section-title--lg"
            >
              {getSiteCopy(tenant, "home.winners.title", copyVars)}
            </SiteCopySlot>
            <Link href="/winners" className="site-rail-section__link">
              <SiteCopySlot copyKey="home.winners.view_all">
                {getSiteCopy(tenant, "home.winners.view_all", copyVars)}
              </SiteCopySlot>
            </Link>
          </div>
          <div className="site-winners-strip site-winners-strip--commerce">
            {recentWinners.slice(0, 5).map((w, i) => (
              <div key={i} className="site-winner-item site-winner-item--commerce">
                <span className="site-winner-item__avatar">
                  {w.winner_name.charAt(0)}
                </span>
                <div>
                  <strong>{w.winner_name}</strong>
                  <p className="site-muted site-winner-item__text">
                    Won {w.prize_name ?? "a prize"} in {w.raffle_title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
