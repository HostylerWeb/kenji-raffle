import Link from "next/link";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";

type RaffleCard = {
  id: string;
  title: string;
  slug: string;
  ticket_price: number;
  featured_image_url: string | null;
  gallery?: { image_url: string }[];
  end_date: string | null;
  tickets_available?: number;
  is_featured: boolean;
  category?: { name: string; slug: string } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default async function HomePage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  if (!tenant) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Site not found</h1>
      </main>
    );
  }

  const accent = tenant.branding?.primary_color ?? "#00a551";

  let featured: RaffleCard[] = [];
  let categories: Category[] = [];
  let recentWinners: { raffle_title: string; winner_name: string; prize_name: string | null }[] = [];

  try {
    featured = await publicFetch<RaffleCard[]>(
      "/v1/raffles?featured=true",
      host,
    );
    categories = await publicFetch<Category[]>("/v1/categories", host);
    recentWinners = await publicFetch<
      { raffle_title: string; winner_name: string; prize_name: string | null }[]
    >("/v1/winners", host);
  } catch {
    featured = [];
    categories = [];
    recentWinners = [];
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      <header
        style={{
          borderBottom: `4px solid ${accent}`,
          paddingBottom: 16,
          marginBottom: 32,
        }}
      >
        <h1 style={{ margin: 0 }}>{tenant.name}</h1>
        <p className="muted">{tenant.hostname}</p>
      </header>

      {categories.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2>Categories</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/raffles?category=${cat.slug}`}
                className="btn btn-secondary"
                style={{ textDecoration: "none" }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Featured raffles</h2>
          <Link href="/raffles">Browse all</Link>
        </div>

        {featured.length === 0 ? (
          <p className="muted">No published raffles yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {featured.map((raffle) => {
              const image =
                raffle.featured_image_url ??
                raffle.gallery?.[0]?.image_url ??
                null;
              return (
                <Link
                  key={raffle.id}
                  href={`/raffles/${raffle.slug}`}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  {image && (
                    <img
                      src={image}
                      alt={raffle.title}
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />
                  )}
                  <h3 style={{ margin: "0 0 8px" }}>{raffle.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    KES {raffle.ticket_price.toLocaleString()} per ticket
                  </p>
                  {raffle.tickets_available != null && (
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {raffle.tickets_available} tickets left
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {recentWinners.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2>Recent winners</h2>
          <ul>
            {recentWinners.slice(0, 5).map((w, i) => (
              <li key={i}>
                {w.winner_name} won {w.prize_name ?? "a prize"} in {w.raffle_title}
              </li>
            ))}
          </ul>
          <Link href="/winners">View all winners</Link>
        </section>
      )}

      <p style={{ marginTop: 32 }}>
        <Link href="/cart">Cart</Link>
        {" · "}
        <Link href="/admin" style={{ color: accent }}>Operator admin</Link>
      </p>
    </main>
  );
}
