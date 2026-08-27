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
  kind: "featured" | "sold" | "ending";
  label: string;
};

function endingBadgeLabel(endDate: string): string | null {
  const end = new Date(endDate);
  const now = new Date();
  if (end.getTime() <= now.getTime()) return null;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfDayAfter = new Date(startOfTomorrow);
  startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);

  if (end >= startOfToday && end < startOfTomorrow) return "Ending today";
  if (end >= startOfTomorrow && end < startOfDayAfter) return "Ending tomorrow";
  return null;
}

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
    const endingLabel = endingBadgeLabel(raffle.end_date);
    if (endingLabel) {
      badges.push({ kind: "ending", label: endingLabel });
    }
  }

  return badges;
}

export function sortRafflesByEndDate(raffles: RaffleCardData[]): RaffleCardData[] {
  return [...raffles].sort((a, b) => {
    const soldA = a.tickets_available === 0 ? 1 : 0;
    const soldB = b.tickets_available === 0 ? 1 : 0;
    if (soldA !== soldB) return soldA - soldB;

    const endA = a.end_date ? new Date(a.end_date).getTime() : Number.POSITIVE_INFINITY;
    const endB = b.end_date ? new Date(b.end_date).getTime() : Number.POSITIVE_INFINITY;
    if (endA !== endB) return endA - endB;

    return a.title.localeCompare(b.title);
  });
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
