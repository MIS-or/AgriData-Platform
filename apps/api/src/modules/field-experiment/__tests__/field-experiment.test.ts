import { describe, it, expect, beforeEach } from 'vitest';
import { ForecastVault } from '../domain/forecast-vault.js';
import {
  analyzeForecastAccuracy,
  compareCohortImpact,
  evaluateRankingDecisions,
} from '../domain/impact-analyzer.js';
import { evaluateGateG6 } from '../application/gate-g6-evaluator.js';
import {
  FieldFarmerEnrollment,
  HarvestActualRecord,
  TimestampedForecastRecord,
} from '@agridata/contracts';

describe('Module 5 [field-experiment]: Field Experiment & Gate G6 Audit', () => {
  let vault: ForecastVault;

  beforeEach(() => {
    vault = new ForecastVault();
  });

  it('seals immutable timestamped forecast records with valid SHA-256 hash and verifies integrity', async () => {
    const sealed = await vault.sealForecast(
      '2026-W32',
      'bok_choy',
      11500,
      14000,
      16500,
      1,
      '2026-08-01T07:00:00.000Z'
    );

    expect(sealed.forecastId).toBe('VAULT_2026-W32_bok_choy');
    expect(sealed.contentHash).toBeDefined();
    expect(sealed.contentHash.length).toBe(64);

    const isValid = await vault.verifyIntegrity(sealed);
    expect(isValid).toBe(true);

    const tampered = { ...sealed, q50PriceVnd: 20000 };
    const isTamperedValid = await vault.verifyIntegrity(tampered);
    expect(isTamperedValid).toBe(false);
  });

  it('evaluates post-harvest price accuracy and directional ranking consistency', () => {
    const forecasts: TimestampedForecastRecord[] = [
      {
        forecastId: 'F1',
        broadcastWeekIso: '2026-W30',
        cropCode: 'bok_choy',
        q10PriceVnd: 12000,
        q50PriceVnd: 14000,
        q90PriceVnd: 16500,
        recommendedRank: 1,
        sealedAtIso: '2026-07-20',
        contentHash: 'hash1',
      },
      {
        forecastId: 'F2',
        broadcastWeekIso: '2026-W30',
        cropCode: 'choi_sum',
        q10PriceVnd: 8000,
        q50PriceVnd: 10000,
        q90PriceVnd: 12000,
        recommendedRank: 2,
        sealedAtIso: '2026-07-20',
        contentHash: 'hash2',
      },
    ];

    const harvests: HarvestActualRecord[] = [
      {
        harvestId: 'H1',
        farmerId: 'FARMER_1',
        cohort: 'PILOT',
        cropCode: 'bok_choy',
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 14500,
        actualYieldKg: 2200,
        totalCostVnd: 16500000,
        revenueVnd: 31900000,
        actualProfitVnd: 15400000,
        isLoss: false,
      },
      {
        harvestId: 'H2',
        farmerId: 'FARMER_2',
        cohort: 'PILOT',
        cropCode: 'choi_sum',
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 9800,
        actualYieldKg: 2000,
        totalCostVnd: 16000000,
        revenueVnd: 19600000,
        actualProfitVnd: 3600000,
        isLoss: false,
      },
    ];

    const accuracy = analyzeForecastAccuracy(harvests, forecasts);
    expect(accuracy.coverage80PctRate).toBe(1.0);
    expect(accuracy.maePriceVnd).toBeLessThan(1000);

    const ranking = evaluateRankingDecisions(harvests, forecasts);
    expect(ranking.totalDecisions).toBe(1);
    expect(ranking.correctDecisions).toBe(1);
    expect(ranking.accuracyPct).toBe(100.0);
  });

  it('compares pilot cohort with control cohort demonstrating reduced loss rate', () => {
    const harvests: HarvestActualRecord[] = [
      ...Array.from({ length: 9 }).map((_, i) => ({
        harvestId: `PILOT_${i}`,
        farmerId: `FP_${i}`,
        cohort: 'PILOT' as const,
        cropCode: 'bok_choy' as const,
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 14000,
        actualYieldKg: 2200,
        totalCostVnd: 16500000,
        revenueVnd: 30800000,
        actualProfitVnd: 14300000,
        isLoss: false,
      })),
      {
        harvestId: 'PILOT_LOSS',
        farmerId: 'FP_9',
        cohort: 'PILOT' as const,
        cropCode: 'lettuce' as const,
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 10000,
        actualYieldKg: 1500,
        totalCostVnd: 21600000,
        revenueVnd: 15000000,
        actualProfitVnd: -6600000,
        isLoss: true,
      },
      ...Array.from({ length: 7 }).map((_, i) => ({
        harvestId: `CONTROL_${i}`,
        farmerId: `FC_${i}`,
        cohort: 'CONTROL' as const,
        cropCode: 'choi_sum' as const,
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 11000,
        actualYieldKg: 2000,
        totalCostVnd: 16000000,
        revenueVnd: 22000000,
        actualProfitVnd: 6000000,
        isLoss: false,
      })),
      ...Array.from({ length: 3 }).map((_, i) => ({
        harvestId: `CONTROL_LOSS_${i}`,
        farmerId: `FC_LOSS_${i}`,
        cohort: 'CONTROL' as const,
        cropCode: 'cucumber' as const,
        plantedWeekIso: '2026-W30',
        harvestWeekIso: '2026-W35',
        actualPriceVndPerKg: 7000,
        actualYieldKg: 3000,
        totalCostVnd: 33250000,
        revenueVnd: 21000000,
        actualProfitVnd: -12250000,
        isLoss: true,
      })),
    ];

    const impact = compareCohortImpact(harvests);
    expect(impact.pilotLossRatePct).toBe(10.0);
    expect(impact.controlLossRatePct).toBe(30.0);
    expect(impact.lossRateRelativeRatio).toBe(0.33);
    expect(impact.pilotAverageProfitVnd).toBeGreaterThan(impact.controlAverageProfitVnd);
  });

  it('passes Gate G6 criteria when ranking accuracy >= 70%, loss rate <= control, and retention >= 70%', () => {
    const farmers: FieldFarmerEnrollment[] = [
      { farmerId: 'FP_1', coopId: 'C1', name: 'Nông hộ 1', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 10000000, baselineLossRatePct: 25, wantsToContinueNextSeason: true },
      { farmerId: 'FP_2', coopId: 'C1', name: 'Nông hộ 2', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 12000000, baselineLossRatePct: 20, wantsToContinueNextSeason: true },
      { farmerId: 'FP_3', coopId: 'C1', name: 'Nông hộ 3', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 15000000, baselineLossRatePct: 15, wantsToContinueNextSeason: true },
      { farmerId: 'FP_4', coopId: 'C1', name: 'Nông hộ 4', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 8000000, baselineLossRatePct: 30, wantsToContinueNextSeason: false },
      { farmerId: 'FC_1', coopId: 'C1', name: 'Đối chứng 1', cohort: 'CONTROL', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 10000000, baselineLossRatePct: 25 },
    ];

    const forecasts: TimestampedForecastRecord[] = [
      { forecastId: 'F1', broadcastWeekIso: '2026-W30', cropCode: 'bok_choy', q10PriceVnd: 12000, q50PriceVnd: 14000, q90PriceVnd: 16500, recommendedRank: 1, sealedAtIso: '2026-07-20', contentHash: 'hash1' },
      { forecastId: 'F2', broadcastWeekIso: '2026-W30', cropCode: 'choi_sum', q10PriceVnd: 8000, q50PriceVnd: 10000, q90PriceVnd: 12000, recommendedRank: 2, sealedAtIso: '2026-07-20', contentHash: 'hash2' },
    ];

    const harvests: HarvestActualRecord[] = [
      { harvestId: 'H1', farmerId: 'FP_1', cohort: 'PILOT', cropCode: 'bok_choy', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 15000, actualYieldKg: 2200, totalCostVnd: 16500000, revenueVnd: 33000000, actualProfitVnd: 16500000, isLoss: false },
      { harvestId: 'H2', farmerId: 'FP_2', cohort: 'PILOT', cropCode: 'choi_sum', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 10000, actualYieldKg: 2000, totalCostVnd: 16000000, revenueVnd: 20000000, actualProfitVnd: 4000000, isLoss: false },
      { harvestId: 'H3', farmerId: 'FC_1', cohort: 'CONTROL', cropCode: 'choi_sum', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 7500, actualYieldKg: 1900, totalCostVnd: 16000000, revenueVnd: 14250000, actualProfitVnd: -1750000, isLoss: true },
    ];

    const audit = evaluateGateG6(farmers, harvests, forecasts);
    expect(audit.passed).toBe(true);
    expect(audit.rankingAccuracyPct).toBeGreaterThanOrEqual(70.0);
    expect(audit.pilotFarmerLossRatePct).toBeLessThanOrEqual(audit.controlFarmerLossRatePct);
    expect(audit.farmerRetentionRatePct).toBeGreaterThanOrEqual(70.0);
    expect(audit.actionDecision).toBe('PROCEED_TO_EXPANSION_G7');
  });

  it('fails Gate G6 if ranking accuracy drops below 70%', () => {
    const farmers: FieldFarmerEnrollment[] = [
      { farmerId: 'FP_1', coopId: 'C1', name: 'Nông hộ 1', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 10000000, baselineLossRatePct: 25, wantsToContinueNextSeason: true },
    ];

    const forecasts: TimestampedForecastRecord[] = [
      { forecastId: 'F1', broadcastWeekIso: '2026-W30', cropCode: 'bok_choy', q10PriceVnd: 12000, q50PriceVnd: 14000, q90PriceVnd: 16500, recommendedRank: 1, sealedAtIso: '2026-07-20', contentHash: 'hash1' },
      { forecastId: 'F2', broadcastWeekIso: '2026-W30', cropCode: 'choi_sum', q10PriceVnd: 8000, q50PriceVnd: 10000, q90PriceVnd: 12000, recommendedRank: 2, sealedAtIso: '2026-07-20', contentHash: 'hash2' },
    ];

    const wrongHarvests: HarvestActualRecord[] = [
      { harvestId: 'H1', farmerId: 'FP_1', cohort: 'PILOT', cropCode: 'bok_choy', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 7000, actualYieldKg: 2200, totalCostVnd: 16500000, revenueVnd: 15400000, actualProfitVnd: -1100000, isLoss: true },
      { harvestId: 'H2', farmerId: 'FP_1', cohort: 'PILOT', cropCode: 'choi_sum', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 15000, actualYieldKg: 2000, totalCostVnd: 16000000, revenueVnd: 30000000, actualProfitVnd: 14000000, isLoss: false },
    ];

    const audit = evaluateGateG6(farmers, wrongHarvests, forecasts);
    expect(audit.passed).toBe(false);
    expect(audit.rankingAccuracyPct).toBe(0.0);
    expect(audit.actionDecision).toBe('HALT_AND_RETRAIN');
  });
});
