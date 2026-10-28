import {
  HarvestActualRecord,
  TimestampedForecastRecord,
} from '@agridata/contracts';

export interface PostHarvestComparison {
  harvestId: string;
  cropCode: string;
  actualPriceVnd: number;
  q10PriceVnd: number;
  q50PriceVnd: number;
  q90PriceVnd: number;
  within80PctInterval: boolean;
  absoluteErrorVnd: number;
  percentageErrorPct: number;
}

export interface RankingDecisionEvaluation {
  broadcastWeekIso: string;
  higherRankCrop: string;
  lowerRankCrop: string;
  higherRankProfitVnd: number;
  lowerRankProfitVnd: number;
  isDirectionallyCorrect: boolean; // higherRankProfit > lowerRankProfit
}

export interface CohortImpactSummary {
  pilotHarvestCount: number;
  pilotLossCount: number;
  pilotLossRatePct: number;
  pilotAverageProfitVnd: number;

  controlHarvestCount: number;
  controlLossCount: number;
  controlLossRatePct: number;
  controlAverageProfitVnd: number;

  lossRateRelativeRatio: number; // pilotLossRate / controlLossRate
  profitImprovementPct: number;
}

/**
 * So sánh dự báo niêm phong với thực tế sau thu hoạch (Mã 6.5)
 */
export function analyzeForecastAccuracy(
  harvests: HarvestActualRecord[],
  sealedForecasts: TimestampedForecastRecord[]
): {
  comparisons: PostHarvestComparison[];
  maePriceVnd: number;
  mapePricePct: number;
  coverage80PctRate: number;
} {
  const forecastMap = new Map<string, TimestampedForecastRecord>();
  for (const f of sealedForecasts) {
    forecastMap.set(`${f.broadcastWeekIso}_${f.cropCode}`, f);
  }

  const comparisons: PostHarvestComparison[] = [];
  let totalAbsError = 0;
  let totalPctError = 0;
  let insideCount = 0;

  for (const h of harvests) {
    const forecast = forecastMap.get(`${h.plantedWeekIso}_${h.cropCode}`);
    if (!forecast) continue;

    const absError = Math.abs(h.actualPriceVndPerKg - forecast.q50PriceVnd);
    const pctError = (absError / Math.max(h.actualPriceVndPerKg, 1)) * 100;
    const isInside =
      h.actualPriceVndPerKg >= forecast.q10PriceVnd &&
      h.actualPriceVndPerKg <= forecast.q90PriceVnd;

    totalAbsError += absError;
    totalPctError += pctError;
    if (isInside) insideCount++;

    comparisons.push({
      harvestId: h.harvestId,
      cropCode: h.cropCode,
      actualPriceVnd: h.actualPriceVndPerKg,
      q10PriceVnd: forecast.q10PriceVnd,
      q50PriceVnd: forecast.q50PriceVnd,
      q90PriceVnd: forecast.q90PriceVnd,
      within80PctInterval: isInside,
      absoluteErrorVnd: absError,
      percentageErrorPct: Number(pctError.toFixed(2)),
    });
  }

  const count = comparisons.length || 1;
  return {
    comparisons,
    maePriceVnd: Math.round(totalAbsError / count),
    mapePricePct: Number((totalPctError / count).toFixed(2)),
    coverage80PctRate: Number((insideCount / count).toFixed(2)),
  };
}

/**
 * Đánh giá độ chính xác hướng quyết định (Ranking Directional Accuracy - Cổng G6 tiêu chí 1)
 * Cây được xếp trên thật sự lời hơn cây xếp dưới.
 */
export function evaluateRankingDecisions(
  harvests: HarvestActualRecord[],
  sealedForecasts: TimestampedForecastRecord[]
): {
  evaluations: RankingDecisionEvaluation[];
  totalDecisions: number;
  correctDecisions: number;
  accuracyPct: number;
} {
  // Nhóm dự báo theo tuần
  const forecastsByWeek = new Map<string, TimestampedForecastRecord[]>();
  for (const f of sealedForecasts) {
    const list = forecastsByWeek.get(f.broadcastWeekIso) || [];
    list.push(f);
    forecastsByWeek.set(f.broadcastWeekIso, list);
  }

  // Nhóm kết quả thu hoạch theo tuần và cây
  const profitByWeekAndCrop = new Map<string, number>();
  for (const h of harvests) {
    const key = `${h.plantedWeekIso}_${h.cropCode}`;
    const current = profitByWeekAndCrop.get(key) || 0;
    profitByWeekAndCrop.set(key, Math.max(current, h.actualProfitVnd));
  }

  const evaluations: RankingDecisionEvaluation[] = [];
  let correctCount = 0;

  for (const [weekIso, cropForecasts] of forecastsByWeek.entries()) {
    // Sắp xếp theo rank tăng dần (rank 1 = khuyến nghị cao nhất)
    const sorted = [...cropForecasts].sort((a, b) => a.recommendedRank - b.recommendedRank);

    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const higher = sorted[i]!;
        const lower = sorted[j]!;

        const profitHigher = profitByWeekAndCrop.get(`${weekIso}_${higher.cropCode}`);
        const profitLower = profitByWeekAndCrop.get(`${weekIso}_${lower.cropCode}`);

        if (profitHigher !== undefined && profitLower !== undefined) {
          const isCorrect = profitHigher >= profitLower;
          if (isCorrect) correctCount++;

          evaluations.push({
            broadcastWeekIso: weekIso,
            higherRankCrop: higher.cropCode,
            lowerRankCrop: lower.cropCode,
            higherRankProfitVnd: profitHigher,
            lowerRankProfitVnd: profitLower,
            isDirectionallyCorrect: isCorrect,
          });
        }
      }
    }
  }

  const total = evaluations.length || 1;
  return {
    evaluations,
    totalDecisions: evaluations.length,
    correctDecisions: correctCount,
    accuracyPct: Number(((correctCount / total) * 100).toFixed(1)),
  };
}

/**
 * So sánh hộ dùng (Pilot) với nhóm đối chiếu (Control) (Mã 6.6)
 */
export function compareCohortImpact(harvests: HarvestActualRecord[]): CohortImpactSummary {
  const pilot = harvests.filter((h) => h.cohort === 'PILOT');
  const control = harvests.filter((h) => h.cohort === 'CONTROL');

  const pilotLossCount = pilot.filter((h) => h.isLoss || h.actualProfitVnd < 0).length;
  const controlLossCount = control.filter((h) => h.isLoss || h.actualProfitVnd < 0).length;

  const pilotLossRate = pilot.length > 0 ? (pilotLossCount / pilot.length) * 100 : 0;
  const controlLossRate = control.length > 0 ? (controlLossCount / control.length) * 100 : 0;

  const pilotAvgProfit =
    pilot.length > 0
      ? pilot.reduce((sum, h) => sum + h.actualProfitVnd, 0) / pilot.length
      : 0;
  const controlAvgProfit =
    control.length > 0
      ? control.reduce((sum, h) => sum + h.actualProfitVnd, 0) / control.length
      : 0;

  const relativeRatio =
    controlLossRate > 0 ? Number((pilotLossRate / controlLossRate).toFixed(2)) : 0;
  const profitImprovement =
    controlAvgProfit > 0
      ? Number((((pilotAvgProfit - controlAvgProfit) / controlAvgProfit) * 100).toFixed(1))
      : 0;

  return {
    pilotHarvestCount: pilot.length,
    pilotLossCount,
    pilotLossRatePct: Number(pilotLossRate.toFixed(1)),
    pilotAverageProfitVnd: Math.round(pilotAvgProfit),

    controlHarvestCount: control.length,
    controlLossCount,
    controlLossRatePct: Number(controlLossRate.toFixed(1)),
    controlAverageProfitVnd: Math.round(controlAvgProfit),

    lossRateRelativeRatio: relativeRatio,
    profitImprovementPct: profitImprovement,
  };
}
