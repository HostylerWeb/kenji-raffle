"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayerToken } from "@/lib/player-api";

export function SitePublicNav({ accent = "#00a551" }: { accent?: string }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getPlayerToken()));
  }, []);

  return (
    <nav
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "8px 20px",
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Link href="/raffles">Raffles</Link>
      <Link href="/cart">Cart</Link>
      <Link href="/winners">Winners</Link>
      <Link href="/play-safe">Play Safe</Link>
      {loggedIn ? (
        <Link href="/account" style={{ color: accent }}>My account</Link>
      ) : (
        <>
          <Link href="/login">Log in</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
