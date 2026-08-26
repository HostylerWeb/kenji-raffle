import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { RaffleCountdown } from "@/components/RaffleCountdown";
import { RaffleGallery } from "@/components/RaffleGallery";
import { PrizeTabs } from "@/components/PrizeTabs";
import { TicketSelector } from "@/components/TicketSelector";
import { formatDateTime, formatKes } from "@/lib/format";
import { getRequestHost, getTenantContext, publicFetch } from "@/lib/tenant";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const raffle = await publicFetch<RaffleDetail>(`/v1/raffles/${slug}`, host).catch(
    () => null,
  );
  if (!raffle || !tenant) return { title: "Raffle" };
  const image =
    raffle.featured_image_url ??
    raffle.gallery?.[0]?.image_url ??
    tenant.branding?.logo_url ??
    undefined;
  return {
    title: `${raffle.title} — ${tenant.name}`,
    description: raffle.description?.slice(0, 160) ?? `Enter ${raffle.title} at ${tenant.name}`,
    openGraph: {
      title: `${raffle.title} — ${tenant.name}`,
      description: raffle.description?.slice(0, 160) ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}

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

  const raffle = await publicFetch<RaffleDetail>(`/v1/raffles/${slug}`, host).catch(
    () => null,
  );

  if (!raffle) notFound();

  const images = [
    ...(raffle.featured_image_url ? [raffle.featured_image_url] : []),
    ...(raffle.gallery?.map((g) => g.image_url) ?? []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const available = raffle.ticket_counts?.available ?? 0;
  const total = raffle.ticket_counts?.total ?? raffle.max_entries;
  const soldPct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const soldOut = available <= 0;

  return (
    <>
      <Link href="/raffles" className="site-breadcrumb">← All raffles</Link>

      <div className="site-detail-grid" style={{ marginTop: 8 }}>
        <div>
          <RaffleGallery images={images} title={raffle.title} />

          {raffle.description && (
            <section style={{ marginTop: 32 }}>
              <h2 className="site-section-title">About this raffle</h2>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{raffle.description}</p>
            </section>
          )}

          <PrizeTabs
            mainPrizes={raffle.prizes ?? []}
            instantPrizes={raffle.instant_win_prizes ?? []}
          />
        </div>

        <aside className="site-detail-buy">
          <div className="site-card site-card--highlight">
            {raffle.category && (
              <span className="site-raffle-card__category">{raffle.category.name}</span>
            )}
            <h1 className="site-page-title" style={{ fontSize: 24, marginBottom: 12 }}>
              {raffle.title}
            </h1>

            <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>
              {formatKes(raffle.ticket_price)}
              <span className="site-muted" style={{ fontSize: 14, fontWeight: 500 }}> per ticket</span>
            </p>

            {raffle.end_date && (
              <div style={{ marginBottom: 16 }}>
                <p className="site-muted" style={{ marginBottom: 8 }}>Competition ends in</p>
                <RaffleCountdown endDate={raffle.end_date} />
                <p className="site-muted" style={{ marginTop: 8, fontSize: 12 }}>
                  {formatDateTime(raffle.end_date)}
                </p>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="site-muted">{available.toLocaleString()} left</span>
                <span className="site-muted">{soldPct}% sold</span>
              </div>
              <div className="site-progress">
                <div className="site-progress__bar" style={{ width: `${soldPct}%` }} />
              </div>
            </div>

            {raffle.quantity_discounts && raffle.quantity_discounts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p className="site-muted" style={{ marginBottom: 6 }}>Quantity discounts</p>
                <ul className="site-muted" style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {raffle.quantity_discounts.map((t) => (
                    <li key={t.min_quantity}>
                      {t.min_quantity}+ tickets —
                      {t.discount_type === "percent"
                        ? ` ${t.discount_value}% off`
                        : ` ${formatKes(t.discount_value)} off`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {soldOut ? (
              <div className="site-empty" style={{ padding: 24 }}>
                <p className="site-empty__title">Sold out</p>
                <p className="site-muted">All tickets for this raffle have been purchased.</p>
                <Link href="/raffles" className="site-btn site-btn--secondary site-btn--sm" style={{ marginTop: 12 }}>
                  Browse other raffles
                </Link>
              </div>
            ) : (
              <TicketSelector
                raffleId={raffle.id}
                ticketPrice={raffle.ticket_price}
                ticketLimitPerUser={raffle.ticket_limit_per_user}
              />
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
