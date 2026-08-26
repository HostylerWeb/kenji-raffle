"use client";

import { useEffect, useState } from "react";

function getTimeLeft(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs, ended: diff === 0 };
}

export function RaffleCountdown({
  endDate,
  compact = false,
}: {
  endDate: string;
  compact?: boolean;
}) {
  const [left, setLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const id = window.setInterval(() => setLeft(getTimeLeft(endDate)), 1000);
    return () => window.clearInterval(id);
  }, [endDate]);

  if (left.ended) {
    return <span className="site-muted">Ended</span>;
  }

  if (compact) {
    const parts = [];
    if (left.days > 0) parts.push(`${left.days}d`);
    parts.push(`${left.hours}h ${left.mins}m`);
    return <span className="site-raffle-card__meta">Ends in {parts.join(" ")}</span>;
  }

  const units = [
    { value: left.days, label: "Days" },
    { value: left.hours, label: "Hrs" },
    { value: left.mins, label: "Mins" },
    { value: left.secs, label: "Secs" },
  ];

  return (
    <div className="site-countdown" role="timer" aria-live="polite">
      {units.map((u) => (
        <div key={u.label} className="site-countdown__unit">
          <span className="site-countdown__value">{String(u.value).padStart(2, "0")}</span>
          <span className="site-countdown__label">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
