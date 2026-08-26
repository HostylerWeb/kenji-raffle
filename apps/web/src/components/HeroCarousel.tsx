"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { RaffleCardData } from "@/components/RaffleCard";
import { RaffleCountdown } from "@/components/RaffleCountdown";
import { formatDrawLabel, formatKes } from "@/lib/format";

type HeroCarouselProps = {
  raffles: RaffleCardData[];
  tenantName: string;
};

export function HeroCarousel({ raffles, tenantName }: HeroCarouselProps) {
  const slides = raffles.filter((r) => r.featured_image_url).slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[index] ?? slides[0];
  const total = slide.max_entries ?? 0;
  const available = slide.tickets_available ?? 0;
  const soldPct =
    total > 0 ? Math.round(((total - available) / total) * 100) : 0;

  return (
    <section className="site-hero-shell site-full-bleed" aria-label="Featured raffles">
      <div className="site-hero-carousel site-hero-carousel--commerce">
        <div className="site-hero-carousel__slide">
          {slide.featured_image_url && (
            <Image
              src={slide.featured_image_url}
              alt=""
              fill
              className="site-hero-carousel__bg"
              sizes="100vw"
              priority
            />
          )}
          <div className="site-hero-carousel__overlay" />
          <div className="site-hero-carousel__content site-container">
            {slide.end_date && (
              <div className="site-hero-carousel__badge">
                {formatDrawLabel(slide.end_date)}
              </div>
            )}
            <p className="site-hero__kicker">Featured at {tenantName}</p>
            <h1 className="site-hero__title">{slide.title}</h1>
            <p className="site-hero__desc">
              From {formatKes(slide.ticket_price)} per ticket
              {total > 0 ? ` · ${soldPct}% sold` : ""} — secure checkout and instant wins.
            </p>
            {slide.end_date && (
              <div className="site-hero-carousel__countdown">
                <RaffleCountdown endDate={slide.end_date} />
              </div>
            )}
            <div className="site-hero__actions">
              <Link href={`/raffles/${slide.slug}`} className="site-btn site-btn--primary site-btn--lg">
                Enter now
              </Link>
              <Link
                href="/raffles"
                className="site-btn site-btn--secondary site-btn--lg site-btn--ghost-light"
              >
                All raffles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="site-hero-thumbs">
          <div className="site-hero-thumbs__track site-container">
            {slides.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className={`site-hero-thumb${i === index ? " site-hero-thumb--active" : ""}`}
                aria-label={`Show ${r.title}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                {r.featured_image_url && (
                  <Image
                    src={r.featured_image_url}
                    alt=""
                    width={120}
                    height={80}
                    className="site-hero-thumb__img"
                  />
                )}
                <span className="site-hero-thumb__text">
                  <span className="site-hero-thumb__title">{r.title}</span>
                  {r.end_date && (
                    <span className="site-hero-thumb__meta">{formatDrawLabel(r.end_date)}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
