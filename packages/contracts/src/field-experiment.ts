import { z } from 'zod';
import { PilotCropCode } from './crops';

export type FieldFarmerCohort = 'PILOT' | 'CONTROL';

export interface FieldFarmerEnrollment {
  farmerId: string;
  coopId: string;
  name: string;
  cohort: FieldFarmerCohort;
  agreementSigned: boolean;
  signedAtIso: string;
  baselineHistoricalProfitVnd: number;
  baselineLossRatePct: number;
  wantsToContinueNextSeason?: boolean;
}

export const FieldFarmerEnrollmentSchema = z.object({
  farmerId: z.string().min(1),
  coopId: z.string().min(1),
  name: z.string().min(1),
  cohort: z.enum(['PILOT', 'CONTROL']),
  agreementSigned: z.boolean(),
  signedAtIso: z.string(),
  baselineHistoricalProfitVnd: z.number(),
  baselineLossRatePct: z.number().min(0).max(100),
  wantsToContinueNextSeason: z.boolean().optional(),
});

export interface TimestampedForecastRecord {
  forecastId: string;
  broadcastWeekIso: string; // e.g. 2026-W30
  cropCode: PilotCropCode;
  q10PriceVnd: number;
  q50PriceVnd: number;
  q90PriceVnd: number;
  recommendedRank: number; // 1 = highest recommendation, 2, 3...
  sealedAtIso: string;
  contentHash: string; // SHA-256 tamper-evident seal
}

export interface HarvestActualRecord {
  harvestId: string;
  farmerId: string;
  cohort: FieldFarmerCohort;
  cropCode: PilotCropCode;
  plantedWeekIso: string;
  harvestWeekIso: string;
  actualPriceVndPerKg: number;
  actualYieldKg: number;
  totalCostVnd: number;
  revenueVnd: number;
  actualProfitVnd: number;
  isLoss: boolean;
}

export interface FieldExperimentAuditResult {
  totalDecisionsWithOutcomes: number;
  correctRankingDecisions: number;
  rankingAccuracyPct: number; // Gate G6 Criterion 1: >= 70%
  pilotFarmerLossRatePct: number;
  controlFarmerLossRatePct: number;
  lossRateRelativeRatio: number; // Gate G6 Criterion 2: pilot <= control
  farmerRetentionRatePct: number; // Gate G6 Criterion 3: >= 70%
  passed: boolean;
  actionDecision: 'PROCEED_TO_EXPANSION_G7' | 'HALT_AND_RETRAIN';
  evaluatedAtIso: string;
}
