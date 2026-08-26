"use client";

import Link from "next/link";
import Image from "next/image";
import type { RaffleCardData } from "@/components/RaffleCard";
import { formatKes } from "@/lib/format";
import {
  placeholderHue,
  placeholderInitials,
  raffleCoverImage,
  raffleStatusBadges,
} from "@/lib/raffle-display";

type FeaturedHeroRailProps = {
  raffles: RaffleCardData[];
  tenantName: string;
  showFooterLink?: boolean;
};

export function FeaturedHeroRail({
  raffles,
  tenantName,
  showFooterLink = true,
}: FeaturedHeroRailProps) {
  const slides = raffles.slice(0, 8);
  if (slides.length === 0) return null;

  return (
    <section className="site-featured-hero" aria-label={`Featured raffles at ${tenantName}`}>
      <div className="site-featured-hero__intro site-container">
        <p className="site-featured-hero__kicker">Licensed raffles · Kenya</p>
        <h1 className="site-featured-hero__headline">
          Win amazing prizes from {tenantName}
        </h1>
        <p className="site-featured-hero__sub">
          Secure checkout, instant wins, and responsible play built in.
        </p>
      </div>

      <div
        className={`site-featured-hero__scroll${slides.length <= 4 ? " site-featured-hero__scroll--few" : ""}`}
      >
        <div className="site-featured-hero__track">
          {slides.map((raffle, index) => {
            const image = raffleCoverImage(raffle);
            const total = raffle.max_entries ?? 0;
            const available = raffle.tickets_available ?? 0;
            const soldPct =
              total > 0 ? Math.round(((total - available) / total) * 100) : 0;
            const soldOut = raffle.tickets_available === 0;
            const badges = raffleStatusBadges(raffle);
            const hue = placeholderHue(raffle.id);

            return (
              <article key={raffle.id} className="site-featured-hero__card">
                <Link href={`/raffles/${raffle.slug}`} className="site-featured-hero__link">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="site-featured-hero__image"
                      sizes="(max-width: 768px) 85vw, 420px"
                      priority={index < 2}
                    />
                  ) : (
                    <div
                      className="site-featured-hero__placeholder"
                      style={{ "--placeholder-hue": hue } as React.CSSProperties}
                      aria-hidden
                    >
                      <span>{placeholderInitials(raffle.title)}</span>
                    </div>
                  )}
                  <div className="site-featured-hero__overlay" />
                  <div className="site-featured-hero__body">
                    {badges.length > 0 && (
                      <div className="site-featured-hero__badges">
                        {badges.map((badge) => (
                          <span
                            key={`${badge.kind}-${badge.label}`}
                            className={`site-featured-hero__badge site-featured-hero__badge--${badge.kind}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="site-featured-hero__title">{raffle.title}</h2>
                    <p className="site-featured-hero__meta">
                      From {formatKes(raffle.ticket_price)}
                      {total > 0 ? ` · ${soldPct}% sold` : ""}
                    </p>
                    {total > 0 && (
                      <div className="site-featured-hero__progress" aria-hidden>
                        <div
                          className="site-featured-hero__progress-bar"
                          style={{ width: `${soldPct}%` }}
                        />
                      </div>
                    )}
                    {!soldOut && (
                      <span className="site-btn site-btn--primary site-featured-hero__cta">
                        Enter now
                      </span>
                    )}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      {showFooterLink && (
        <div className="site-featured-hero__footer site-container">
          <Link href="/raffles" className="site-btn site-btn--secondary site-btn--sm">
            View all raffles
          </Link>
        </div>
      )}
    </section>
  );
}
