"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getCartSessionId, playerFetch, setPlayerSession } from "@/lib/player-api";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";

type PlayerRegisterFormProps = {
  onAuthenticated?: () => void | Promise<void>;
  submitLabel?: string;
  next?: string;
  compact?: boolean;
  idPrefix?: string;
};

export function PlayerRegisterForm({
  onAuthenticated,
  submitLabel = "Create account",
  next = "/",
  compact = false,
  idPrefix = "player-register",
}: PlayerRegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [dob, setDob] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await playerFetch("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || undefined,
          date_of_birth: dob,
          county: county || undefined,
          phone: phone || undefined,
        }),
      });
      const login = await playerFetch<{
        access_token: string;
        refresh_token: string;
      }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          cart_session_id: getCartSessionId(),
        }),
      });
      setPlayerSession(login.access_token, login.refresh_token);
      await onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="site-form" onSubmit={onSubmit} noValidate>
      <label htmlFor={`${idPrefix}-email`}>
        Email
        <input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-invalid={error ? true : undefined}
        />
      </label>
      <label htmlFor={`${idPrefix}-password`}>
        Password
        <input
          id={`${idPrefix}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label htmlFor={`${idPrefix}-name`}>
        Full name
        <input
          id={`${idPrefix}-name`}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </label>
      {!compact && (
        <>
          <label htmlFor={`${idPrefix}-phone`}>
            Phone (+254)
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              autoComplete="tel"
            />
          </label>
          <label htmlFor={`${idPrefix}-county`}>
            County
            <select
              id={`${idPrefix}-county`}
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              <option value="">Select county</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label htmlFor={`${idPrefix}-dob`}>
        Date of birth
        <input
          id={`${idPrefix}-dob`}
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
      </label>
      <label className="site-checkbox">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          required
        />
        <span>
          I agree to the <Link href="/terms">Terms</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>
        </span>
      </label>
      {error && (
        <p className="site-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="site-btn site-btn--primary site-btn--block"
        disabled={loading || !acceptedTerms}
      >
        {loading ? "Creating account…" : submitLabel}
      </button>
      {!compact && (
        <p className="site-muted" style={{ textAlign: "center", margin: 0 }}>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
        </p>
      )}
    </form>
  );
}
