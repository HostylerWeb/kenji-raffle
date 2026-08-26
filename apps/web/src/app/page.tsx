import Link from "next/link";
import { headers } from "next/headers";
import { HeroCarousel } from "@/components/HeroCarousel";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";

type Category = { id: string; name: string; slug: string };

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
  const featuredRaffles = featured.length > 0 ? featured : liveRaffles;
  const heroRaffle = featured[0] ?? liveRaffles[0];
  const moreRaffles =
    featured.length > 0
      ? liveRaffles.filter((r) => !featured.some((f) => f.id === r.id))
      : [];

  const carouselRaffles =
    featured.length >= 2 ? featured : featured.length > 0 ? featured : liveRaffles.slice(0, 3);

  return (
    <>
      {loadError && (
        <div className="site-banner site-banner--warning" role="alert">
          Some content could not be loaded. Please refresh the page or try again shortly.
        </div>
      )}

      {carouselRaffles.filter((r) => r.featured_image_url).length >= 2 ? (
        <HeroCarousel raffles={carouselRaffles} tenantName={tenant.name} />
      ) : (
        <section className="site-hero">
          {heroRaffle?.featured_image_url && (
            <img
              src={heroRaffle.featured_image_url}
              alt=""
              className="site-hero__bg"
            />
          )}
          <div className="site-hero__overlay" />
          <div className="site-hero__content">
            <p className="site-hero__kicker">Licensed raffles · Kenya</p>
            <h1 className="site-hero__title">
              {heroRaffle?.title ?? `Welcome to ${tenant.name}`}
            </h1>
            <p className="site-hero__desc">
              Enter for a chance to win amazing prizes. Secure payments, instant
              wins, and responsible play built in.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/raffles" className="site-btn site-btn--primary site-btn--lg">
                Browse raffles
              </Link>
              {heroRaffle && (
                <Link
                  href={`/raffles/${heroRaffle.slug}`}
                  className="site-btn site-btn--secondary site-btn--lg"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}
                >
                  Featured raffle
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="site-trust-strip" aria-label="Trust indicators">
        <span>18+ only</span>
        <span>Licensed operator</span>
        <span>Secure gateway payments</span>
        <span>Play Safe controls</span>
      </div>

      {categories.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="site-section-title">Categories</h2>
          <div className="site-filters">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/raffles?category=${cat.slug}`}
                className="site-filter-chip"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <h2 className="site-section-title" style={{ margin: 0 }}>
            {featured.length > 0 ? "Featured raffles" : "Live raffles"}
          </h2>
          <Link href="/raffles" className="site-btn site-btn--secondary site-btn--sm">
            View all
          </Link>
        </div>
        {liveRaffles.length === 0 ? (
          <div className="site-empty">
            <h3 className="site-empty__title">No raffles live yet</h3>
            <p className="site-muted">Check back soon for new competitions.</p>
            <Link href="/contact" className="site-btn site-btn--secondary site-btn--sm" style={{ marginTop: 16 }}>
              Contact us
            </Link>
          </div>
        ) : (
          <div className="site-raffle-grid">
            {featuredRaffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        )}
      </section>

      {moreRaffles.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
            <h2 className="site-section-title" style={{ margin: 0 }}>All live raffles</h2>
            <Link href="/raffles" className="site-btn site-btn--secondary site-btn--sm">
              View all
            </Link>
          </div>
          <div className="site-raffle-grid">
            {moreRaffles.slice(0, 6).map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 48 }}>
        <h2 className="site-section-title">How it works</h2>
        <div className="site-steps">
          <div className="site-step">
            <div className="site-step__num">1</div>
            <p className="site-step__title">Choose a raffle</p>
            <p className="site-step__desc">Browse live competitions and pick your favourites.</p>
          </div>
          <div className="site-step">
            <div className="site-step__num">2</div>
            <p className="site-step__title">Select tickets</p>
            <p className="site-step__desc">Add tickets to your cart — reservations hold while you checkout.</p>
          </div>
          <div className="site-step">
            <div className="site-step__num">3</div>
            <p className="site-step__title">Pay securely</p>
            <p className="site-step__desc">Complete payment via our licensed payment gateway.</p>
          </div>
          <div className="site-step">
            <div className="site-step__num">4</div>
            <p className="site-step__title">Win &amp; claim</p>
            <p className="site-step__desc">Instant wins credit immediately. Main prizes drawn after close.</p>
          </div>
        </div>
      </section>

      {recentWinners.length > 0 && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
            <h2 className="site-section-title" style={{ margin: 0 }}>Recent winners</h2>
            <Link href="/winners">View all</Link>
          </div>
          <div className="site-winners-strip">
            {recentWinners.slice(0, 5).map((w, i) => (
              <div key={i} className="site-winner-item">
                <span className="site-winner-item__avatar">
                  {w.winner_name.charAt(0)}
                </span>
                <div>
                  <strong>{w.winner_name}</strong>
                  <p className="site-muted" style={{ margin: "2px 0 0" }}>
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
