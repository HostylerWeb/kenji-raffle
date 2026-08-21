"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken, playerFetch } from "@/lib/player-api";

export default function PlaySafePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [until, setUntil] = useState<string | null>(null);

  async function activate() {
    if (!getPlayerToken()) {
      router.replace("/login?next=/account/play-safe");
      return;
    }
    const result = await playerFetch<{ play_safe_until: string | null }>("/v1/account/play-safe", {
      method: "POST",
    });
    setUntil(result.play_safe_until);
    setMessage("Play Safe activated for 7 days. Checkout will be blocked.");
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>
      <h1>Play Safe</h1>
      <p><Link href="/account">← Account</Link></p>
      <div className="card">
        <p>Activate a 7-day cooling-off period. You will not be able to purchase tickets until it ends.</p>
        {message && <p style={{ color: "#15803d" }}>{message}</p>}
        {until && <p className="muted">Active until {new Date(until).toLocaleString()}</p>}
        <button type="button" className="btn" onClick={activate}>Activate Play Safe</button>
      </div>
    </main>
  );
}
