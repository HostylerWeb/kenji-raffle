"use client";

import { useMemo, useState } from "react";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";
import { sortRafflesByEndDate } from "@/lib/raffle-display";

type Category = { id: string; name: string; slug: string };

export function HomeLiveCatalog({
  raffles,
  categories,
  limit = 12,
}: {
  raffles: RaffleCardData[];
  categories: Category[];
  limit?: number;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sorted = useMemo(() => sortRafflesByEndDate(raffles), [raffles]);

  const filtered = useMemo(() => {
    if (!activeCategory) return sorted;
    return sorted.filter((raffle) => raffle.category?.slug === activeCategory);
  }, [sorted, activeCategory]);

  const displayed = filtered.slice(0, limit);

  return (
    <>
      {categories.length > 0 && (
        <div className="site-catalog-tabs" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === null}
            className={`site-catalog-tab${activeCategory === null ? " site-catalog-tab--active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.slug}
              className={`site-catalog-tab${activeCategory === category.slug ? " site-catalog-tab--active" : ""}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {displayed.length === 0 ? (
        <p className="site-muted site-catalog-empty">No raffles in this category right now.</p>
      ) : (
        <div className="site-raffle-grid site-raffle-grid--commerce">
          {displayed.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      )}
    </>
  );
}
