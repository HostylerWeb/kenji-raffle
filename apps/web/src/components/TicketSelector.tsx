"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicApiUrl } from "@/lib/api-config";
import { notifyCartUpdated } from "@/lib/cart-events";
import { formatKes } from "@/lib/format";
import { getTenantHost, playerFetch } from "@/lib/player-api";
import { trackAddToCart } from "./AnalyticsScripts";
import { useToast } from "./ToastProvider";

const PRESETS = [1, 5, 10, 25];

export function TicketSelector({
  raffleId,
  ticketPrice,
  maxQty = 50,
  ticketLimitPerUser,
}: {
  raffleId: string;
  ticketPrice: number;
  maxQty?: number;
  ticketLimitPerUser?: number | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const limit = ticketLimitPerUser ?? maxQty;
  const effectiveMax = Math.min(maxQty, limit);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => ticketPrice * qty, [ticketPrice, qty]);

  function setQuantity(next: number) {
    setQty(Math.max(1, Math.min(effectiveMax, next)));
  }

  async function addToCart() {
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
      const ctx = await fetch(
        `${getPublicApiUrl()}/v1/tenant/context`,
        { headers: { "x-forwarded-host": getTenantHost() } },
      )
        .then((r) => r.json())
        .catch(() => null);
      trackAddToCart(ctx?.analytics ?? null, { raffle_id: raffleId, quantity: qty });
      notifyCartUpdated();
      toast(`${qty} ticket${qty > 1 ? "s" : ""} added to cart`);
      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-ticket-selector">
      <div className="site-ticket-presets">
        {PRESETS.filter((p) => p <= effectiveMax).map((preset) => (
          <button
            key={preset}
            type="button"
            className={`site-ticket-preset${qty === preset ? " site-ticket-preset--active" : ""}`}
            onClick={() => setQuantity(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="site-ticket-stepper">
        <button type="button" onClick={() => setQuantity(qty - 1)} disabled={qty <= 1} aria-label="Decrease">
          −
        </button>
        <input
          type="number"
          min={1}
          max={effectiveMax}
          value={qty}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          aria-label="Ticket quantity"
        />
        <button
          type="button"
          onClick={() => setQuantity(qty + 1)}
          disabled={qty >= effectiveMax}
          aria-label="Increase"
        >
          +
        </button>
      </div>

      {ticketLimitPerUser != null && (
        <p className="site-muted">Maximum {ticketLimitPerUser} tickets per person</p>
      )}

      <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
        Total: {formatKes(total)}
      </p>

      {error && <p className="site-error">{error}</p>}

      <button
        type="button"
        className="site-btn site-btn--primary site-btn--lg site-btn--block"
        disabled={loading}
        onClick={addToCart}
      >
        {loading ? "Adding…" : `Add ${qty} ticket${qty > 1 ? "s" : ""} to cart`}
      </button>
    </div>
  );
}
