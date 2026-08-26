import Link from "next/link";
import { RaffleCard, type RaffleCardData } from "@/components/RaffleCard";

type RaffleRailProps = {
  title: string;
  raffles: RaffleCardData[];
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function RaffleRail({
  title,
  raffles,
  viewAllHref,
  viewAllLabel = "View all",
}: RaffleRailProps) {
  if (raffles.length === 0) return null;

  const sectionId = `rail-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="site-rail-section" aria-labelledby={sectionId}>
      <div className="site-rail-section__head site-container">
        <h2 className="site-rail-section__title" id={sectionId}>
          {title}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="site-rail-section__link">
            {viewAllLabel} →
          </Link>
        )}
      </div>
      <div className="site-rail-scroll">
        <div className="site-rail-track">
          <div className="site-rail-track__pad" aria-hidden />
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} layout="rail" />
          ))}
          <div className="site-rail-track__pad" aria-hidden />
        </div>
      </div>
    </section>
  );
}
