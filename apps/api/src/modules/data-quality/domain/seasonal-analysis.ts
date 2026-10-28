import { CropCode } from '@agridata/contracts';

export interface WeeklySeasonalPoint {
  weekNumber: number; // 1 -> 52
  averagePriceVnd: number;
  seasonalIndex: number; // Tỷ số so với giá bình quân năm (ví dụ 1.25 = cao hơn 25%)
  sampleCount: number;
}

export interface SeasonalSignalReport {
  cropCode: CropCode;
  overallMeanPriceVnd: number;
  peakWeek: number;
  troughWeek: number;
  peakToTroughRatio: number;
  hasClearSeasonalSignal: boolean; // Gate G0: Kiểm tra có mùa vụ rõ rệt không
  weeklyIndices: WeeklySeasonalPoint[];
}

/**
 * Phân tích chỉ số mùa vụ 52 tuần trong năm (Task 0.6 / Gate G0)
 */
export function calculateSeasonalIndices(
  cropCode: CropCode,
  historicalWeeklyPrices: { weekNumber: number; priceVnd: number }[]
): SeasonalSignalReport {
  if (historicalWeeklyPrices.length < 52) {
    throw new Error('Cần ít nhất 52 tuần dữ liệu để phân tích mùa vụ');
  }

  const totalPrice = historicalWeeklyPrices.reduce((sum, p) => sum + p.priceVnd, 0);
  const overallMean = totalPrice / historicalWeeklyPrices.length;

  const weeklyBuckets: Record<number, number[]> = {};
  for (let w = 1; w <= 52; w++) {
    weeklyBuckets[w] = [];
  }

  for (const item of historicalWeeklyPrices) {
    if (item.weekNumber >= 1 && item.weekNumber <= 52) {
      weeklyBuckets[item.weekNumber]?.push(item.priceVnd);
    }
  }

  const weeklyIndices: WeeklySeasonalPoint[] = [];
  let peakWeek = 1;
  let maxIdx = -Infinity;
  let troughWeek = 1;
  let minIdx = Infinity;

  for (let w = 1; w <= 52; w++) {
    const prices = weeklyBuckets[w] || [];
    const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : overallMean;
    const seasonalIndex = Number((avg / overallMean).toFixed(3));

    if (seasonalIndex > maxIdx) {
      maxIdx = seasonalIndex;
      peakWeek = w;
    }
    if (seasonalIndex < minIdx) {
      minIdx = seasonalIndex;
      troughWeek = w;
    }

    weeklyIndices.push({
      weekNumber: w,
      averagePriceVnd: Math.round(avg),
      seasonalIndex,
      sampleCount: prices.length,
    });
  }

  const peakToTroughRatio = Number((maxIdx / minIdx).toFixed(2));
  // Tín hiệu mùa vụ được coi là rõ rệt nếu biên độ biến động giữa đỉnh và đáy >= 30% (tỷ số >= 1.30)
  const hasClearSeasonalSignal = peakToTroughRatio >= 1.3;

  return {
    cropCode,
    overallMeanPriceVnd: Math.round(overallMean),
    peakWeek,
    troughWeek,
    peakToTroughRatio,
    hasClearSeasonalSignal,
    weeklyIndices,
  };
}
