"use client";

import { useState } from "react";
import Image from "next/image";

export function RaffleGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="site-gallery">
      <div className="site-gallery__main">
        <Image
          src={images[active] ?? images[0]}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="site-gallery__image"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="site-gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`site-gallery__thumb${i === active ? " site-gallery__thumb--active" : ""}`}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => setActive(i)}
            >
              <Image src={src} alt="" width={96} height={64} className="site-gallery__thumb-img" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
