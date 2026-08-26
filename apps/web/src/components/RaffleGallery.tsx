"use client";

import { useState } from "react";

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
    <div>
      <div
        style={{
          borderRadius: "var(--site-radius)",
          overflow: "hidden",
          aspectRatio: "16/10",
          background: "var(--site-bg)",
          marginBottom: 12,
        }}
      >
        <img
          src={images[active]}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              style={{
                padding: 0,
                border: i === active ? "2px solid var(--site-accent)" : "2px solid transparent",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                width: 72,
                height: 48,
              }}
            >
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
