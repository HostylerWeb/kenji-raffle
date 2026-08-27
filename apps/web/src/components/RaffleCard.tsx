import Link from "next/link";
import Image from "next/image";
import { RaffleCountdown } from "./RaffleCountdown";
import { formatKes } from "@/lib/format";
import {
  placeholderHue,
  placeholderInitials,
  raffleCoverImage,
  raffleStatusBadges,
} from "@/lib/raffle-display";

export type RaffleCardData = {
  id: string;
  title: string;
  slug: string;
  ticket_price: number;
  featured_image_url?: string | null;
  gallery?: { image_url: string }[];
  end_date?: string | null;
  tickets_available?: number;
  max_entries?: number;
  is_featured?: boolean;
  category?: { name: string; slug?: string } | null;
};

export function RaffleCard({
  raffle,
  layout = "grid",
}: {
  raffle: RaffleCardData;
  layout?: "grid" | "rail";
}) {
  const image = raffleCoverImage(raffle);
  const soldOut = raffle.tickets_available === 0;
  const total = raffle.max_entries ?? 0;
  const available = raffle.tickets_available ?? 0;
  const soldPct =
    total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const badges = raffleStatusBadges(raffle);
  const hue = placeholderHue(raffle.id);

  return (
    <Link
      href={`/raffles/${raffle.slug}`}
      className={`site-raffle-card site-raffle-card--commerce${layout === "rail" ? " site-raffle-card--rail" : ""}${soldOut ? " site-raffle-card--sold" : ""}`}
    >
      <div className="site-raffle-card__media">
        {image ? (
          <Image
            src={image}
            alt={raffle.title}
            fill
            sizes={
              layout === "rail"
                ? "280px"
                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="site-raffle-card__image"
          />
        ) : (
          <div
            className="site-raffle-card__placeholder site-raffle-card__placeholder--rich"
            style={{ "--placeholder-hue": hue } as React.CSSProperties}
          >
            <span className="site-raffle-card__placeholder-letter">
              {placeholderInitials(raffle.title)}
            </span>
          </div>
        )}
        {badges.length > 0 && (
          <div className="site-raffle-card__badges">
            {badges.map((badge) => (
              <span
                key={`${badge.kind}-${badge.label}`}
                className={`site-raffle-card__badge site-raffle-card__badge--${badge.kind}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="site-raffle-card__body">
        {raffle.category && (
          <span className="site-raffle-card__category">{raffle.category.name}</span>
        )}
        <div className="site-raffle-card__title-row">
          <h3 className="site-raffle-card__title">{raffle.title}</h3>
          <span className="site-raffle-card__price-inline">{formatKes(raffle.ticket_price)}</span>
        </div>
        {raffle.tickets_available != null && total > 0 && (
          <div className="site-raffle-card__progress-wrap">
            <div className="site-raffle-card__progress-meta">
              <span>Sold: {soldPct}%</span>
              <span>{available.toLocaleString()} left</span>
            </div>
            <div className="site-progress site-progress--commerce" aria-hidden>
              <div className="site-progress__bar" style={{ width: `${soldPct}%` }} />
            </div>
          </div>
        )}
        {raffle.end_date && !soldOut && (
          <div className="site-raffle-card__countdown-row">
            <span className="site-raffle-card__countdown-label">Closes in</span>
            <RaffleCountdown endDate={raffle.end_date} compact />
          </div>
        )}
      </div>
      {!soldOut && (
        <span className="site-btn site-btn--primary site-btn--block site-raffle-card__enter">
          Enter now
        </span>
      )}
    </Link>
  );
}
