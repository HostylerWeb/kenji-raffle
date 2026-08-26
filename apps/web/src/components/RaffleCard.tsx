import Link from "next/link";
import Image from "next/image";
import { RaffleCountdown } from "./RaffleCountdown";
import { formatKes } from "@/lib/format";

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

function isEndingSoon(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  const diff = new Date(endDate).getTime() - Date.now();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
}

export function RaffleCard({ raffle }: { raffle: RaffleCardData }) {
  const image =
    raffle.featured_image_url ?? raffle.gallery?.[0]?.image_url ?? null;
  const soldOut = raffle.tickets_available === 0;
  const endingSoon = !soldOut && isEndingSoon(raffle.end_date);
  const total = raffle.max_entries ?? 0;
  const available = raffle.tickets_available ?? 0;
  const soldPct =
    total > 0 ? Math.round(((total - available) / total) * 100) : 0;

  return (
    <Link href={`/raffles/${raffle.slug}`} className="site-raffle-card">
      <div className="site-raffle-card__media">
        {image ? (
          <Image
            src={image}
            alt={raffle.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="site-raffle-card__image"
          />
        ) : (
          <div className="site-raffle-card__placeholder">
            {raffle.title.charAt(0)}
          </div>
        )}
        {raffle.is_featured && !soldOut && (
          <span className="site-raffle-card__badge site-raffle-card__badge--featured">
            Featured
          </span>
        )}
        {soldOut && (
          <span className="site-raffle-card__badge site-raffle-card__badge--sold">
            Sold out
          </span>
        )}
        {endingSoon && (
          <span className="site-raffle-card__badge site-raffle-card__badge--ending">
            Ending soon
          </span>
        )}
      </div>
      <div className="site-raffle-card__body">
        {raffle.category && (
          <span className="site-raffle-card__category">{raffle.category.name}</span>
        )}
        <h3 className="site-raffle-card__title">{raffle.title}</h3>
        <span className="site-raffle-card__price">{formatKes(raffle.ticket_price)}</span>
        {raffle.tickets_available != null && total > 0 && (
          <>
            <span className="site-raffle-card__meta">
              {available.toLocaleString()} tickets left · {soldPct}% sold
            </span>
            <div className="site-progress" aria-hidden>
              <div className="site-progress__bar" style={{ width: `${soldPct}%` }} />
            </div>
          </>
        )}
        {raffle.end_date && !soldOut && (
          <RaffleCountdown endDate={raffle.end_date} compact />
        )}
      </div>
    </Link>
  );
}
