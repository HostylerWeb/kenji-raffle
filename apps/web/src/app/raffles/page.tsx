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

export default async function RafflesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; ending_soon?: string; featured?: string }>;
}) {
  const params = await searchParams;
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  if (!tenant) {
    return <main style={{ padding: 40 }}><h1>Site not found</h1></main>;
  }

  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.ending_soon) query.set("ending_soon", "true");
  if (params.featured) query.set("featured", "true");

  const raffles = await publicFetch<RaffleCard[]>(
    `/v1/raffles?${query.toString()}`,
    host,
  ).catch(() => [] as RaffleCard[]);

  const categories = await publicFetch<Category[]>("/v1/categories", host).catch(
    () => [] as Category[],
  );

  const accent = tenant.branding?.primary_color ?? "#00a551";

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      <header style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: accent }}>← {tenant.name}</Link>
        <h1 style={{ marginTop: 12 }}>All raffles</h1>
      </header>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <Link
          href="/raffles"
          className="btn btn-secondary"
          style={{ textDecoration: "none" }}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/raffles?category=${cat.slug}`}
            className="btn btn-secondary"
            style={{
              textDecoration: "none",
              background: params.category === cat.slug ? accent : undefined,
            }}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          href="/raffles?ending_soon=true"
          className="btn btn-secondary"
          style={{
            textDecoration: "none",
            background: params.ending_soon ? accent : undefined,
          }}
        >
          Ending soon
        </Link>
        <Link
          href="/raffles?featured=true"
          className="btn btn-secondary"
          style={{
            textDecoration: "none",
            background: params.featured ? accent : undefined,
          }}
        >
          Featured
        </Link>
      </div>

      {raffles.length === 0 ? (
        <p className="muted">No raffles match your filters.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {raffles.map((raffle) => {
            const image =
              raffle.featured_image_url ?? raffle.gallery?.[0]?.image_url ?? null;
            return (
              <Link
                key={raffle.id}
                href={`/raffles/${raffle.slug}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit" }}
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
                {raffle.category && (
                  <p className="muted" style={{ margin: "0 0 4px" }}>
                    {raffle.category.name}
                  </p>
                )}
                <p className="muted" style={{ margin: 0 }}>
                  KES {raffle.ticket_price.toLocaleString()} ·{" "}
                  {raffle.tickets_available ?? "—"} left
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
