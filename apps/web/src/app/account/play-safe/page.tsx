"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/AccountPageHeader";
import { formatDateTime } from "@/lib/format";
import {
  PLAY_SAFE_DURATIONS,
  playSafeDurationLabel,
  remainingPlaySafeText,
} from "@/lib/play-safe";
import { playerFetch } from "@/lib/player-api";

type Profile = {
  county: string | null;
  spending_limit: number | null;
  spending_limit_period: string | null;
  play_safe_active: boolean;
  play_safe_until: string | null;
};

export default function PlaySafePage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const [until, setUntil] = useState<string | null>(null);
  const [county, setCounty] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    playerFetch<Profile>("/v1/me")
      .then((me) => {
        setActive(me.play_safe_active);
        setUntil(me.play_safe_until);
        setCounty(me.county ?? "");
        setLimit(me.spending_limit != null ? String(me.spending_limit) : "");
        setPeriod(me.spending_limit_period ?? "");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load Play Safe settings");
      })
      .finally(() => setInitialLoading(false));
  }, []);

  async function activate() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await playerFetch<{
        play_safe_until: string | null;
        duration_days: number;
      }>("/v1/account/play-safe", {
        method: "POST",
        body: JSON.stringify({ duration_days: durationDays }),
      });
      setActive(true);
      setUntil(result.play_safe_until);
      setMessage(
        `Purchases paused for ${playSafeDurationLabel(result.duration_days)}. You can still browse raffles and manage your account.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not activate Play Safe");
    } finally {
      setLoading(false);
    }
  }

  async function saveLimits(e: FormEvent) {
    e.preventDefault();
    setSavingLimits(true);
    setError("");
    setMessage("");
    try {
      await playerFetch("/v1/account/profile", {
        method: "PATCH",
        body: JSON.stringify({
          spending_limit: limit ? Number(limit) : null,
          spending_limit_period: period || null,
        }),
      });
      setMessage(
        limit && period
          ? `Spending limit set to KES ${Number(limit).toLocaleString()} per ${period === "weekly" ? "week" : "month"}.`
          : "Spending limit cleared.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save spending limit");
    } finally {
      setSavingLimits(false);
    }
  }

  if (initialLoading) {
    return (
      <>
        <AccountPageHeader title="Play Safe" description="Stay in control of your spending." />
        <div className="site-skeleton" style={{ height: 200 }} />
      </>
    );
  }

  const countyMissing = !county.trim();
  const limitSummary =
    limit && period
      ? `KES ${Number(limit).toLocaleString()} per ${period === "weekly" ? "week" : "month"}`
      : "No limit set";

  return (
    <>
      <AccountPageHeader
        title="Play Safe"
        description="Pause purchases or cap how much you spend — you choose what works for you."
      />

      {message && <p className="site-success-text">{message}</p>}
      {error && <p className="site-error">{error}</p>}

      <div className="site-card site-account-section">
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Purchase pause</h2>
        <p className="site-muted" style={{ marginTop: 0, lineHeight: 1.65 }}>
          Choose how long to pause ticket purchases. During this time you cannot check out,
          but you can still view your account, tickets, and wins.
        </p>

        {active && until ? (
          <div className="site-banner site-banner--warning" role="status" style={{ marginTop: 16 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700 }}>Purchases are paused</p>
            <p style={{ margin: 0 }}>
              Until {formatDateTime(until)} · {remainingPlaySafeText(until)}
            </p>
          </div>
        ) : (
          <>
            <fieldset className="site-play-safe-durations" style={{ marginTop: 16 }}>
              <legend className="site-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                How long would you like to pause?
              </legend>
              <div className="site-play-safe-duration-grid">
                {PLAY_SAFE_DURATIONS.map((option) => (
                  <label
                    key={option.days}
                    className={`site-play-safe-duration${durationDays === option.days ? " site-play-safe-duration--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={option.days}
                      checked={durationDays === option.days}
                      onChange={() => setDurationDays(option.days)}
                    />
                    <span className="site-play-safe-duration__label">{option.label}</span>
                    <span className="site-play-safe-duration__hint">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {countyMissing && (
              <p className="site-banner site-banner--warning" style={{ marginTop: 16 }}>
                Set your county in{" "}
                <Link href="/account/settings">Settings</Link> before activating a purchase pause
                (required for regulatory reporting).
              </p>
            )}

            <button
              type="button"
              className="site-btn site-btn--primary"
              style={{ marginTop: 16 }}
              onClick={activate}
              disabled={loading || countyMissing}
            >
              {loading
                ? "Activating…"
                : `Pause purchases for ${playSafeDurationLabel(durationDays)}`}
            </button>
          </>
        )}
      </div>

      <form className="site-form site-card site-account-section" onSubmit={saveLimits}>
        <h2 className="site-section-title" style={{ marginTop: 0 }}>Spending limit</h2>
        <p className="site-muted" style={{ marginTop: 0, lineHeight: 1.65 }}>
          Cap how much you can spend on tickets over a rolling period. Checkout is blocked once
          you reach your limit. Currently: <strong>{limitSummary}</strong>.
        </p>
        <div className="site-form__row">
          <label>
            Maximum spend (KES)
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              type="number"
              min={0}
              placeholder="e.g. 5000"
            />
          </label>
          <label>
            Period
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">No limit</option>
              <option value="weekly">Per week</option>
              <option value="monthly">Per month</option>
            </select>
          </label>
        </div>
        <button type="submit" className="site-btn site-btn--secondary" disabled={savingLimits}>
          {savingLimits ? "Saving…" : "Save spending limit"}
        </button>
      </form>

      <div className="site-card site-account-section">
        <h2 className="site-section-title" style={{ marginTop: 0 }}>How it works</h2>
        <ul className="site-play-safe-help">
          <li>
            <strong>Purchase pause</strong> — blocks new ticket purchases for your chosen duration.
          </li>
          <li>
            <strong>Spending limit</strong> — lets you keep playing but stops checkout when you hit
            your weekly or monthly cap.
          </li>
          <li>
            Both tools are independent. You can use one, both, or neither.
          </li>
        </ul>
      </div>
    </>
  );
}
