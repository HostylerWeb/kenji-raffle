import Link from "next/link";
import { headers } from "next/headers";
import { CategoryDiscovery } from "@/components/CategoryDiscovery";
import { FeaturedHeroRail } from "@/components/FeaturedHeroRail";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";
import { RaffleRail } from "@/components/RaffleRail";
import { SiteStatsStrip } from "@/components/SiteStatsStrip";
import { pickHeroRaffles, planHomeSections } from "@/lib/raffle-display";
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
  const catalogRaffles = liveRaffles.slice(0, CATALOG_LIMIT);

  const totalTicketsSold = liveRaffles.reduce((sum, r) => {
    const total = r.max_entries ?? 0;
    const available = r.tickets_available ?? 0;
    return sum + Math.max(0, total - available);
  }, 0);

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
      />

      <div className="site-trust-strip site-trust-strip--merged site-container" aria-label="Trust indicators">
        <span className="site-trust-strip__lead">
          Licensed raffles · Secure payments · Instant wins
        </span>
        <span className="site-trust-strip__divider" aria-hidden>
          ·
        </span>
        <span>18+ only</span>
        <span>Play responsibly</span>
        <span>Play Safe controls</span>
      </div>

      {liveRaffles.length === 0 ? (
        <section className="site-section site-container">
          <div className="site-empty site-empty--commerce">
            <h3 className="site-empty__title">No raffles live yet</h3>
            <p className="site-muted">Check back soon for new competitions.</p>
            <Link href="/contact" className="site-btn site-btn--secondary site-btn--sm">
              Contact us
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="site-section site-section--catalog site-container">
            <div className="site-section-header">
              <div>
                <h2 className="site-section-title site-section-title--lg">Live raffles</h2>
                <p className="site-lead site-section-header__lead">
                  {liveRaffles.length} competitions open — pick tickets and enter now.
                </p>
              </div>
              <Link href="/raffles" className="site-rail-section__link">
                View all →
              </Link>
            </div>

            {(categories.length > 0 || liveRaffles.length > 0) && (
              <div className="site-catalog-filters">
                <p className="site-catalog-filters__label">Browse by</p>
                <CategoryDiscovery categories={categories} />
              </div>
            )}

            <div className="site-raffle-grid site-raffle-grid--commerce">
              {catalogRaffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>

            {liveRaffles.length > CATALOG_LIMIT && (
              <div className="site-catalog-more">
                <Link href="/raffles" className="site-btn site-btn--secondary">
                  View all {liveRaffles.length} raffles
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
                  View all →
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
            <h2 className="site-section-title site-section-title--lg site-section-title--light">
              How it works
            </h2>
            <div className="site-steps site-steps--commerce">
              <div className="site-step site-step--commerce">
                <div className="site-step__num">1</div>
                <p className="site-step__title">Choose a raffle</p>
                <p className="site-step__desc">Browse live competitions and pick your favourites.</p>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">2</div>
                <p className="site-step__title">Select tickets</p>
                <p className="site-step__desc">Add tickets to your cart — reservations hold while you checkout.</p>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">3</div>
                <p className="site-step__title">Pay securely</p>
                <p className="site-step__desc">Complete payment via our licensed payment gateway.</p>
              </div>
              <div className="site-step site-step--commerce">
                <div className="site-step__num">4</div>
                <p className="site-step__title">Win &amp; claim</p>
                <p className="site-step__desc">Instant wins credit immediately. Main prizes drawn after close.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {recentWinners.length > 0 && (
        <section className="site-section site-section--winners site-container">
          <div className="site-section-header">
            <h2 className="site-section-title site-section-title--lg">Recent winners</h2>
            <Link href="/winners" className="site-rail-section__link">
              View all →
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
