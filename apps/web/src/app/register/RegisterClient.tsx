"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCartSessionId, playerFetch, setPlayerSession } from "@/lib/player-api";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";

export default function RegisterClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Register</h1>
      <p className="muted">You must be 18+ to play.</p>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          Phone (+254)
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254712345678"
          />
        </label>
        <label>
          County
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Date of birth
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={loading}>Create account</button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Already have an account?</Link>
      </p>
    </main>
  );
}
