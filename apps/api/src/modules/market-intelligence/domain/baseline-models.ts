export interface HistoricalWeeklyRow {
  yearWeek: string;
  weekNumber: number;
  avgPriceVnd: number;
}

/**
 * Mô hình mốc tham chiếu (Baseline Models - Mã việc 3.3):
 * 1. Giá cùng tuần năm trước (Same week last year)
 * 2. Trung bình mùa vụ 4 tuần gần nhất
 */
export function predictBaselineSameWeekLastYear(
  targetWeekNumber: number,
  lastYearWeeklyPrices: Record<number, number>,
  fallbackPrice: number
): number {
  return lastYearWeeklyPrices[targetWeekNumber] || fallbackPrice;
}

export function predictBaselineRollingMean(
  recentPrices: number[],
  fallbackPrice: number
): number {
  if (recentPrices.length === 0) return fallbackPrice;
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  return Math.round(sum / recentPrices.length);
}
