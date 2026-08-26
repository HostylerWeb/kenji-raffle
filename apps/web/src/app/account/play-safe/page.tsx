"use client";

import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { playerFetch } from "@/lib/player-api";
import { formatDateTime } from "@/lib/format";

export default function PlaySafePage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const [until, setUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    playerFetch<{ play_safe_active: boolean; play_safe_until: string | null }>("/v1/me")
      .then((me) => {
        setActive(me.play_safe_active);
        setUntil(me.play_safe_until);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load Play Safe status");
      })
      .finally(() => setInitialLoading(false));
  }, []);

  async function activate() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await playerFetch<{ play_safe_until: string | null }>("/v1/account/play-safe", {
        method: "POST",
      });
      setActive(true);
      setUntil(result.play_safe_until);
      setMessage("Play Safe activated for 7 days. Checkout will be blocked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not activate Play Safe");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <>
        <AccountPageHeader title="Play Safe" description="Take a cooling-off break from purchasing." />
        <div className="site-skeleton" style={{ height: 120 }} />
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        title="Play Safe"
        description="Take a cooling-off break from purchasing tickets."
      />
      <div className="site-card site-card--highlight">
        <p style={{ lineHeight: 1.65, marginTop: 0 }}>
          Activate a 7-day cooling-off period. You will not be able to purchase tickets until it ends.
          This helps you stay in control of your spending.
        </p>
        {active && until && (
          <p className="site-banner site-banner--warning" role="status">
            Play Safe is active until {formatDateTime(until)}. Purchases are paused until then.
          </p>
        )}
        {message && <p className="site-success-text">{message}</p>}
        {error && <p className="site-error">{error}</p>}
        {!active && (
          <button type="button" className="site-btn site-btn--primary" onClick={activate} disabled={loading}>
            {loading ? "Activating…" : "Activate Play Safe"}
          </button>
        )}
      </div>
    </>
  );
}
