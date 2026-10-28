import {
  FieldExperimentAuditResult,
  FieldFarmerEnrollment,
  HarvestActualRecord,
  TimestampedForecastRecord,
} from '@agridata/contracts';
import {
  compareCohortImpact,
  evaluateRankingDecisions,
} from './impact-analyzer.js';

export function evaluateGateG6(
  farmers: FieldFarmerEnrollment[],
  harvests: HarvestActualRecord[],
  sealedForecasts: TimestampedForecastRecord[]
): FieldExperimentAuditResult {
  // 1. Tiêu chí 1: Khuyến nghị đúng hướng >= 70%
  const rankingEval = evaluateRankingDecisions(harvests, sealedForecasts);

  // 2. Tiêu chí 2: Tỷ lệ vụ lỗ của hộ dùng không cao hơn nhóm đối chiếu
  const cohortImpact = compareCohortImpact(harvests);

  // 3. Tiêu chí 3: Tỷ lệ giữ chân nông hộ >= 70%
  const pilotFarmers = farmers.filter((f) => f.cohort === 'PILOT');
  const retainedCount = pilotFarmers.filter((f) => f.wantsToContinueNextSeason !== false).length;
  const retentionRatePct =
    pilotFarmers.length > 0
      ? Number(((retainedCount / pilotFarmers.length) * 100).toFixed(1))
      : 100;

  const criterion1Passed = rankingEval.accuracyPct >= 70.0;
  const criterion2Passed =
    cohortImpact.pilotLossRatePct <= cohortImpact.controlLossRatePct;
  const criterion3Passed = retentionRatePct >= 70.0;

  const passed = criterion1Passed && criterion2Passed && criterion3Passed;

  return {
    totalDecisionsWithOutcomes: rankingEval.totalDecisions,
    correctRankingDecisions: rankingEval.correctDecisions,
    rankingAccuracyPct: rankingEval.accuracyPct,
    pilotFarmerLossRatePct: cohortImpact.pilotLossRatePct,
    controlFarmerLossRatePct: cohortImpact.controlLossRatePct,
    lossRateRelativeRatio: cohortImpact.lossRateRelativeRatio,
    farmerRetentionRatePct: retentionRatePct,
    passed,
    actionDecision: passed ? 'PROCEED_TO_EXPANSION_G7' : 'HALT_AND_RETRAIN',
    evaluatedAtIso: new Date().toISOString(),
  };
}
