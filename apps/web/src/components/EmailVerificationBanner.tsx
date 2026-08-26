"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { playerFetch } from "@/lib/player-api";

export function EmailVerificationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    playerFetch<{ email_verified?: boolean }>("/v1/me")
      .then((me) => setShow(me.email_verified === false))
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return (
    <div className="site-banner site-banner--warning" role="status">
      <p style={{ margin: 0 }}>
        Please verify your email before purchasing tickets.{" "}
        <Link href="/verify-email">Verify now</Link>
      </p>
    </div>
  );
}
