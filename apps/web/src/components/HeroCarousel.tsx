"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { RaffleCardData } from "@/components/RaffleCard";
import { formatKes } from "@/lib/format";

type HeroCarouselProps = {
  raffles: RaffleCardData[];
  tenantName: string;
};

export function HeroCarousel({ raffles, tenantName }: HeroCarouselProps) {
  const slides = raffles.filter((r) => r.featured_image_url).slice(0, 3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[index] ?? slides[0];

  return (
    <section className="site-hero-carousel" aria-label="Featured raffles">
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
        <div className="site-hero-carousel__content">
          <p className="site-hero__kicker">Featured at {tenantName}</p>
          <h1 className="site-hero__title">{slide.title}</h1>
          <p className="site-hero__desc">
            From {formatKes(slide.ticket_price)} per ticket — secure checkout and instant wins.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <Link href={`/raffles/${slide.slug}`} className="site-btn site-btn--primary site-btn--lg">
              Enter now
            </Link>
            <Link
              href="/raffles"
              className="site-btn site-btn--secondary site-btn--lg"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}
            >
              All raffles
            </Link>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="site-hero-carousel__dots" aria-label="Carousel pagination">
          {slides.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`site-hero-carousel__dot${i === index ? " site-hero-carousel__dot--active" : ""}`}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
