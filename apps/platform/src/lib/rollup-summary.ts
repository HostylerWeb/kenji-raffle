type RollupRow = {
  date: string;
  gross_sales: number;
  orders_count: number;
  tax_collected: number;
  failed_gra_events: number;
};

export type RollupWindowSummary = {
  gross_sales: number;
  tax_collected: number;
  orders_count: number;
  failed_gra_events: number;
};

export function rollupWindowSummary(
  rows: RollupRow[],
  days: number,
): RollupWindowSummary {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const filtered = rows.filter((row) => row.date >= cutoffStr);
  return {
    gross_sales: filtered.reduce((sum, r) => sum + r.gross_sales, 0),
    tax_collected: filtered.reduce((sum, r) => sum + r.tax_collected, 0),
    orders_count: filtered.reduce((sum, r) => sum + r.orders_count, 0),
    failed_gra_events: filtered.reduce((sum, r) => sum + r.failed_gra_events, 0),
  };
}
