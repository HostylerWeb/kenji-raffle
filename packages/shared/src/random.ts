/** Fisher–Yates shuffle (unbiased). Returns a new array. */
export function fisherYatesShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Pick `count` distinct random items without replacement. */
export function pickRandomItems<T>(items: T[], count: number): T[] {
  if (count <= 0 || items.length === 0) return [];
  return fisherYatesShuffle(items).slice(0, Math.min(count, items.length));
}
