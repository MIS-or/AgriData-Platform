import { Hono } from 'hono';
import {
  globalForecastVault,
} from '../services/field-experiment/forecast-vault.js';
import {
  analyzeForecastAccuracy,
  compareCohortImpact,
  evaluateRankingDecisions,
} from '../services/field-experiment/impact-analyzer.js';
import { evaluateGateG6 } from '../services/field-experiment/gate-g6-evaluator.js';
import {
  FieldFarmerEnrollment,
  HarvestActualRecord,
  TimestampedForecastRecord,
} from '@agridata/contracts';

export const fieldAuditRouter = new Hono();

// POST /api/v1/field/forecast-vault/seal
fieldAuditRouter.post('/forecast-vault/seal', async (c) => {
  try {
    const body = await c.req.json();
    const { broadcastWeekIso, cropCode, q10PriceVnd, q50PriceVnd, q90PriceVnd, recommendedRank } = body;
    const sealed = await globalForecastVault.sealForecast(
      broadcastWeekIso,
      cropCode,
      Number(q10PriceVnd),
      Number(q50PriceVnd),
      Number(q90PriceVnd),
      Number(recommendedRank)
    );
    return c.json({ success: true, sealedRecord: sealed });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/v1/field/forecast-vault
fieldAuditRouter.get('/forecast-vault', (c) => {
  const records = globalForecastVault.getAllForecasts();
  return c.json({ success: true, count: records.length, records });
});

// POST /api/v1/field/impact-report
fieldAuditRouter.post('/impact-report', async (c) => {
  try {
    const body = await c.req.json();
    const harvests: HarvestActualRecord[] = body.harvests || [];
    const forecasts: TimestampedForecastRecord[] =
      body.forecasts || globalForecastVault.getAllForecasts();

    const accuracy = analyzeForecastAccuracy(harvests, forecasts);
    const ranking = evaluateRankingDecisions(harvests, forecasts);
    const cohort = compareCohortImpact(harvests);

    return c.json({
      success: true,
      accuracy,
      ranking,
      cohort,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/v1/field/gate-g6-audit
fieldAuditRouter.get('/gate-g6-audit', (c) => {
  // Bộ dữ liệu thực địa mẫu 2 vụ chuẩn hóa
  const sampleFarmers: FieldFarmerEnrollment[] = [
    { farmerId: 'F1', coopId: 'C1', name: 'Hộ 1', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 10000000, baselineLossRatePct: 30, wantsToContinueNextSeason: true },
    { farmerId: 'F2', coopId: 'C1', name: 'Hộ 2', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 12000000, baselineLossRatePct: 25, wantsToContinueNextSeason: true },
    { farmerId: 'F3', coopId: 'C1', name: 'Hộ 3', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 9000000, baselineLossRatePct: 35, wantsToContinueNextSeason: true },
    { farmerId: 'F4', coopId: 'C1', name: 'Hộ 4', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 11000000, baselineLossRatePct: 20, wantsToContinueNextSeason: false },
    { farmerId: 'F5', coopId: 'C1', name: 'Hộ 5', cohort: 'PILOT', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 13000000, baselineLossRatePct: 15, wantsToContinueNextSeason: true },
    { farmerId: 'F6', coopId: 'C1', name: 'Hộ Đối Chứng 1', cohort: 'CONTROL', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 10000000, baselineLossRatePct: 30 },
    { farmerId: 'F7', coopId: 'C1', name: 'Hộ Đối Chứng 2', cohort: 'CONTROL', agreementSigned: true, signedAtIso: '2026-06-01', baselineHistoricalProfitVnd: 11000000, baselineLossRatePct: 28 },
  ];

  const sampleForecasts: TimestampedForecastRecord[] = [
    { forecastId: 'V1', broadcastWeekIso: '2026-W30', cropCode: 'bok_choy', q10PriceVnd: 12000, q50PriceVnd: 14500, q90PriceVnd: 17000, recommendedRank: 1, sealedAtIso: '2026-07-20', contentHash: 'hash1' },
    { forecastId: 'V2', broadcastWeekIso: '2026-W30', cropCode: 'choi_sum', q10PriceVnd: 8500, q50PriceVnd: 10500, q90PriceVnd: 13000, recommendedRank: 2, sealedAtIso: '2026-07-20', contentHash: 'hash2' },
  ];

  const sampleHarvests: HarvestActualRecord[] = [
    { harvestId: 'H1', farmerId: 'F1', cohort: 'PILOT', cropCode: 'bok_choy', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 15000, actualYieldKg: 2200, totalCostVnd: 16500000, revenueVnd: 33000000, actualProfitVnd: 16500000, isLoss: false },
    { harvestId: 'H2', farmerId: 'F2', cohort: 'PILOT', cropCode: 'choi_sum', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 10000, actualYieldKg: 2000, totalCostVnd: 16000000, revenueVnd: 20000000, actualProfitVnd: 4000000, isLoss: false },
    { harvestId: 'H3', farmerId: 'F6', cohort: 'CONTROL', cropCode: 'choi_sum', plantedWeekIso: '2026-W30', harvestWeekIso: '2026-W35', actualPriceVndPerKg: 7500, actualYieldKg: 1900, totalCostVnd: 16000000, revenueVnd: 14250000, actualProfitVnd: -1750000, isLoss: true },
  ];

  const audit = evaluateGateG6(sampleFarmers, sampleHarvests, sampleForecasts);
  return c.json({
    gate: 'G6',
    ...audit,
  });
});
