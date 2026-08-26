"use client";

import { useState } from "react";
import { formatKes } from "@/lib/format";

type Prize = {
  id: string;
  name: string;
  prize_type: string;
  value_kes: number | null;
};

type InstantPrize = {
  id: string;
  name: string;
  prize_type: string;
  prize_value: number;
};

export function PrizeTabs({
  mainPrizes,
  instantPrizes,
}: {
  mainPrizes: Prize[];
  instantPrizes: InstantPrize[];
}) {
  const hasMain = mainPrizes.length > 0;
  const hasInstant = instantPrizes.length > 0;
  const [tab, setTab] = useState<"main" | "instant">(
    hasMain ? "main" : "instant",
  );

  if (!hasMain && !hasInstant) return null;

  return (
    <section className="site-detail-section">
      <h2 className="site-section-title site-section-title--lg">Prizes</h2>
      <div className="site-tabs site-tabs--commerce" role="tablist" aria-label="Prizes">
        {hasMain && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === "main"}
            className={`site-tab${tab === "main" ? " site-tab--active" : ""}`}
            onClick={() => setTab("main")}
          >
            Main prizes
          </button>
        )}
        {hasInstant && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === "instant"}
            className={`site-tab${tab === "instant" ? " site-tab--active" : ""}`}
            onClick={() => setTab("instant")}
          >
            Instant wins
          </button>
        )}
      </div>

      {tab === "main" && hasMain && (
        <ul className="site-prize-list site-prize-list--commerce" role="tabpanel">
          {mainPrizes.map((prize) => (
            <li key={prize.id} className="site-prize-item">
              <span className="site-prize-item__icon" aria-hidden>
                🏆
              </span>
              <span>
                <strong>{prize.name}</strong>
                {prize.value_kes != null && (
                  <span className="site-muted"> — {formatKes(prize.value_kes)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === "instant" && hasInstant && (
        <ul className="site-prize-list site-prize-list--commerce" role="tabpanel">
          {instantPrizes.map((prize) => (
            <li key={prize.id} className="site-prize-item">
              <span className="site-prize-item__icon" aria-hidden>
                ⚡
              </span>
              <span>
                <strong>{prize.name}</strong>
                <span className="site-muted"> — {formatKes(prize.prize_value)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
