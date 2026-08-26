"use client";

import { useEffect, useState } from "react";

export function ReservationCountdown({
  expiresAt,
  className,
}: {
  expiresAt: string | null;
  className?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const deadline = expiresAt;
    if (!deadline) {
      setLabel(null);
      setExpired(false);
      return;
    }

    const expiresMs = new Date(deadline).getTime();

    function tick() {
      const ms = expiresMs - Date.now();
      if (ms <= 0) {
        setExpired(true);
        setLabel("Reservations expired — refresh your cart to continue.");
        return;
      }
      setExpired(false);
      const totalSec = Math.floor(ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      setLabel(
        `Tickets reserved for ${min}:${sec.toString().padStart(2, "0")} — complete checkout before time runs out.`,
      );
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  if (!label) return null;

  return (
    <p
      className={className ?? (expired ? "site-error" : "site-reservation-countdown")}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
