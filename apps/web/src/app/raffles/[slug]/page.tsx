import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";
import { AddToCartButton } from "@/components/AddToCartButton";

type RaffleDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  ticket_price: number;
  max_entries: number;
  min_tickets: number;
  ticket_limit_per_user?: number | null;
  end_date: string | null;
  featured_image_url: string | null;
  gallery?: { id: string; image_url: string; sort_order: number }[];
  prizes?: {
    id: string;
    name: string;
    prize_type: string;
    value_kes: number | null;
    image_url: string | null;
  }[];
  instant_win_prizes?: {
    id: string;
    name: string;
    prize_type: string;
    prize_value: number;
  }[];
  ticket_counts?: {
    available: number;
    reserved: number;
    purchased: number;
    total: number;
  };
  quantity_discounts?: {
    min_quantity: number;
    discount_type: string;
    discount_value: number;
  }[];
  category?: { name: string } | null;
};

export default async function RaffleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  if (!tenant) notFound();

  const raffle = await publicFetch<RaffleDetail>(
    `/v1/raffles/${slug}`,
    host,
  ).catch(() => null);

  if (!raffle) notFound();

  const accent = tenant.branding?.primary_color ?? "#00a551";
  const hero =
    raffle.featured_image_url ?? raffle.gallery?.[0]?.image_url ?? null;
  const available = raffle.ticket_counts?.available ?? 0;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      <Link href="/raffles" style={{ color: accent }}>← All raffles</Link>

      <article style={{ marginTop: 16 }}>
        {hero && (
          <img
            src={hero}
            alt={raffle.title}
            style={{
              width: "100%",
              maxHeight: 360,
              objectFit: "cover",
              borderRadius: 12,
              marginBottom: 20,
            }}
          />
        )}

        <h1 style={{ marginTop: 0 }}>{raffle.title}</h1>
        {raffle.category && (
          <p className="muted">{raffle.category.name}</p>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>
            <strong>KES {raffle.ticket_price.toLocaleString()}</strong> per ticket
          </p>
          <p className="muted" style={{ margin: 0 }}>
            {available} of {raffle.max_entries} tickets available
          </p>
          {raffle.ticket_limit_per_user != null && (
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Max {raffle.ticket_limit_per_user} tickets per person
            </p>
          )}
          {raffle.end_date && (
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Ends {new Date(raffle.end_date).toLocaleString()}
            </p>
          )}
          {raffle.quantity_discounts && raffle.quantity_discounts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Quantity discounts</strong>
              <ul className="muted" style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                {raffle.quantity_discounts.map((t) => (
                  <li key={t.min_quantity}>
                    Buy {t.min_quantity}+ tickets —
                    {t.discount_type === "percent"
                      ? `${t.discount_value}% off`
                      : `KES ${t.discount_value.toLocaleString()} off`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {available > 0 ? (
            <div style={{ marginTop: 16 }}>
              <AddToCartButton raffleId={raffle.id} accent={accent} />
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>Sold out</p>
          )}
        </div>

        {raffle.description && (
          <section style={{ marginBottom: 24 }}>
            <h2>About this raffle</h2>
            <p>{raffle.description}</p>
          </section>
        )}

        {raffle.gallery && raffle.gallery.length > 1 && (
          <section style={{ marginBottom: 24 }}>
            <h2>Gallery</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {raffle.gallery.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  style={{
                    width: 120,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {raffle.prizes && raffle.prizes.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2>Main prizes</h2>
            <ul>
              {raffle.prizes.map((prize) => (
                <li key={prize.id}>
                  {prize.name}
                  {prize.value_kes != null && (
                    <> — KES {prize.value_kes.toLocaleString()}</>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {raffle.instant_win_prizes && raffle.instant_win_prizes.length > 0 && (
          <section>
            <h2>Instant wins</h2>
            <ul>
              {raffle.instant_win_prizes.map((prize) => (
                <li key={prize.id}>
                  {prize.name} — KES {prize.prize_value.toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
