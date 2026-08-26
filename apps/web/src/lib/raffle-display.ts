import { formatDrawLabel } from "@/lib/format";
import type { RaffleCardData } from "@/components/RaffleCard";

export function raffleCoverImage(raffle: RaffleCardData): string | null {
  return raffle.featured_image_url ?? raffle.gallery?.[0]?.image_url ?? null;
}

export function isEndingSoon(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  const diff = new Date(endDate).getTime() - Date.now();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
}

export type RaffleStatusBadge = {
  kind: "featured" | "sold" | "ending" | "draw";
  label: string;
};

export function raffleStatusBadges(raffle: RaffleCardData): RaffleStatusBadge[] {
  const soldOut = raffle.tickets_available === 0;
  if (soldOut) {
    return [{ kind: "sold", label: "Sold out" }];
  }

  const badges: RaffleStatusBadge[] = [];
  if (raffle.is_featured) {
    badges.push({ kind: "featured", label: "Featured" });
  }

  if (raffle.end_date) {
    if (isEndingSoon(raffle.end_date)) {
      badges.push({
        kind: "ending",
        label: `Ending soon · ${formatDrawLabel(raffle.end_date)}`,
      });
    } else {
      badges.push({ kind: "draw", label: formatDrawLabel(raffle.end_date) });
    }
  }

  return badges;
}

export function placeholderHue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * 17) % 360;
  }
  return hash;
}

export function placeholderInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function raffleKey(raffle: RaffleCardData): string {
  return raffle.title.trim().toLowerCase();
}

export function dedupeRaffles(raffles: RaffleCardData[]): RaffleCardData[] {
  const seen = new Set<string>();
  return raffles.filter((raffle) => {
    const key = raffleKey(raffle);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const HERO_LIMIT = 8;
const MIN_RAIL_ITEMS = 3;
const MIN_GRID_ITEMS = 3;

export function pickHeroRaffles(
  liveRaffles: RaffleCardData[],
  featured: RaffleCardData[],
  endingSoon: RaffleCardData[],
  limit = HERO_LIMIT,
): RaffleCardData[] {
  return dedupeRaffles([...featured, ...endingSoon, ...liveRaffles]).slice(0, limit);
}

export function planHomeSections(
  liveRaffles: RaffleCardData[],
  featured: RaffleCardData[],
  endingSoon: RaffleCardData[],
  heroRaffles: RaffleCardData[],
) {
  const count = liveRaffles.length;
  if (count === 0) {
    return {
      showEndingSoonRail: false,
      endingSoonRail: [] as RaffleCardData[],
      showGrid: false,
      gridRaffles: [] as RaffleCardData[],
      gridTitle: "Live raffles",
    };
  }

  const heroIds = new Set(heroRaffles.map((raffle) => raffle.id));

  if (count <= 4) {
    return {
      showEndingSoonRail: false,
      endingSoonRail: [],
      showGrid: true,
      gridRaffles: dedupeRaffles(liveRaffles),
      gridTitle: featured.length > 0 ? "Featured raffles" : "Live raffles",
    };
  }

  const endingSoonRail = dedupeRaffles(
    endingSoon.filter((raffle) => !heroIds.has(raffle.id)),
  ).slice(0, 12);
  const showEndingSoonRail = endingSoonRail.length >= MIN_RAIL_ITEMS;

  const shownIds = new Set(heroIds);
  if (showEndingSoonRail) {
    endingSoonRail.forEach((raffle) => shownIds.add(raffle.id));
  }

  const gridRaffles = dedupeRaffles(
    liveRaffles.filter((raffle) => !shownIds.has(raffle.id)),
  );

  return {
    showEndingSoonRail,
    endingSoonRail,
    showGrid: gridRaffles.length >= MIN_GRID_ITEMS,
    gridRaffles: gridRaffles.slice(0, 6),
    gridTitle: "More live raffles",
  };
}
