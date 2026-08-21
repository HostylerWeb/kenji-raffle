"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { playerFetch, getTenantHost } from "@/lib/player-api";
import { trackAddToCart } from "./AnalyticsScripts";

export function AddToCartButton({
  raffleId,
  accent,
}: {
  raffleId: string;
  accent: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<{
    ga4_measurement_id?: string;
    facebook_pixel_id?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002"}/v1/tenant/context`, {
      headers: { "x-forwarded-host": getTenantHost() },
    })
      .then((r) => r.json())
      .then((ctx) => setAnalytics(ctx.analytics ?? null))
      .catch(() => undefined);
  }, []);

  async function add() {
    setLoading(true);
    setError("");
    try {
      await playerFetch("/v1/cart/items", {
        method: "POST",
        body: JSON.stringify({
          raffle_id: raffleId,
          ticket_quantity: qty,
        }),
      });
      trackAddToCart(analytics, { raffle_id: raffleId, quantity: qty });
      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8 }}>
        Tickets
        <input
          type="number"
          min={1}
          max={50}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          style={{ padding: 8, marginLeft: 8, width: 80 }}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button
        type="button"
        className="btn"
        style={{ background: accent }}
        disabled={loading}
        onClick={add}
      >
        {loading ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
