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

function compactCountdownParts(left: ReturnType<typeof getTimeLeft>) {
  return [
    { value: String(left.days).padStart(2, "0"), label: "D" },
    { value: String(left.hours).padStart(2, "0"), label: "H" },
    { value: String(left.mins).padStart(2, "0"), label: "M" },
    { value: String(left.secs).padStart(2, "0"), label: "S" },
  ];
}

function CompactCountdownPlaceholder() {
  return (
    <div className="site-card-countdown site-card-countdown--placeholder" aria-hidden="true">
      {["D", "H", "M", "S"].map((label) => (
        <span key={label} className="site-card-countdown__part">
          <span className="site-card-countdown__value">--</span>
          <span className="site-card-countdown__label">{label}</span>
        </span>
      ))}
    </div>
  );
}

export function RaffleCountdown({
  endDate,
  compact = false,
}: {
  endDate: string;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    setMounted(true);
    setLeft(getTimeLeft(endDate));
    const id = window.setInterval(() => setLeft(getTimeLeft(endDate)), 1000);
    return () => window.clearInterval(id);
  }, [endDate]);

  if (!mounted) {
    if (compact) {
      return <CompactCountdownPlaceholder />;
    }
    return (
      <div className="site-countdown site-countdown--placeholder" aria-hidden="true">
        <div className="site-countdown__unit">
          <span className="site-countdown__value">--</span>
          <span className="site-countdown__label">Loading</span>
        </div>
      </div>
    );
  }

  if (left.ended) {
    return <span className="site-card-countdown__ended">Ended</span>;
  }

  if (compact) {
    const parts = compactCountdownParts(left);
    const ariaLabel = [
      left.days > 0 ? `${left.days} days` : null,
      `${left.hours} hours`,
      `${left.mins} minutes`,
      `${left.secs} seconds`,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="site-card-countdown" role="timer" aria-live="polite" aria-label={ariaLabel}>
        {parts.map((part) => (
          <span key={part.label} className="site-card-countdown__part">
            <span className="site-card-countdown__value">{part.value}</span>
            <span className="site-card-countdown__label">{part.label}</span>
          </span>
        ))}
      </div>
    );
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
