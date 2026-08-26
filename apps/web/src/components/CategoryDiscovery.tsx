"use client";

import Link from "next/link";

type Category = { id: string; name: string; slug: string };

const QUICK_LINKS = [
  { href: "/raffles?featured=true", label: "Featured", icon: "★" },
  { href: "/raffles?ending_soon=true", label: "Ending soon", icon: "⏱" },
  { href: "/raffles", label: "All raffles", icon: "🎟" },
  { href: "/winners", label: "Winners", icon: "🏆" },
];

export function CategoryDiscovery({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string | null;
}) {
  const tileCount = QUICK_LINKS.length + categories.length;
  const wrapTiles = tileCount <= 8;

  return (
    <div className="site-discovery">
      <div className={`site-discovery__scroll${wrapTiles ? " site-discovery__scroll--static" : ""}`}>
        <div className={`site-discovery__track${wrapTiles ? " site-discovery__track--wrap" : ""}`}>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="site-discovery__tile">
              <span className="site-discovery__icon" aria-hidden>
                {link.icon}
              </span>
              <span className="site-discovery__label">{link.label}</span>
            </Link>
          ))}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/raffles?category=${cat.slug}`}
              className={`site-discovery__tile${activeSlug === cat.slug ? " site-discovery__tile--active" : ""}`}
            >
              <span className="site-discovery__icon" aria-hidden>
                {cat.name.charAt(0)}
              </span>
              <span className="site-discovery__label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
