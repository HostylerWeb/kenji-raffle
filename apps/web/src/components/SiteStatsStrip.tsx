type SiteStatsStripProps = {
  liveRaffles?: number;
  ticketsSold?: number;
  prizesValue?: string;
};

export function SiteStatsStrip({
  liveRaffles = 0,
  ticketsSold,
  prizesValue,
}: SiteStatsStripProps) {
  const stats = [
    {
      value: liveRaffles > 0 ? `${liveRaffles}+` : null,
      label: "Live raffles",
    },
    {
      value: ticketsSold != null && ticketsSold > 0 ? formatCompact(ticketsSold) : null,
      label: "Tickets sold",
    },
    {
      value: prizesValue ?? null,
      label: "In prizes",
    },
  ].filter((stat): stat is { value: string; label: string } => stat.value != null);

  return (
    <div className="site-stats-strip" aria-label="Site statistics">
      {stats.length === 0 ? null : stats.map((stat) => (
        <div key={stat.label} className="site-stats-strip__item">
          <span className="site-stats-strip__value">{stat.value}</span>
          <span className="site-stats-strip__label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K+`;
  return `${n}+`;
}
