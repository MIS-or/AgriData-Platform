import { describe, it, expect } from 'vitest';
import {
  FarmerCropLogSchema,
  CANDIDATE_15_DATA_SOURCES,
} from './index.js';

describe('Ingestion & Data Sources Contracts Test', () => {
  it('verifies Candidate 15 Data Sources catalog meets Gate G0 condition', () => {
    expect(CANDIDATE_15_DATA_SOURCES.length).toBe(15);
    const stableSources = CANDIDATE_15_DATA_SOURCES.filter((s) => s.isStable);
    // Cổng G0 yêu cầu: Ít nhất 3 nguồn giá lấy được ổn định
    expect(stableSources.length).toBeGreaterThanOrEqual(3);
  });

  it('validates correct farmer crop log payload', () => {
    const validLog = {
      farmerAnonymousId: 'farmer_001_anphutan',
      cooperativeId: 'htx_an_phu_tan',
      cropCode: 'bok_choy',
      plantingDate: '2026-10-15',
      plantedAreaM2: 2500,
      seedCostVnd: 500000,
      fertilizerCostVnd: 1200000,
      pesticideCostVnd: 600000,
      laborAndFuelCostVnd: 1500000,
    };

    const parsed = FarmerCropLogSchema.parse(validLog);
    expect(parsed.cropCode).toBe('bok_choy');
    expect(parsed.plantedAreaM2).toBe(2500);
  });

  it('rejects invalid crop code or negative area in farmer log', () => {
    const invalidLog = {
      farmerAnonymousId: 'farmer_002',
      cropCode: 'sau_rieng', // Không thuộc 4 cây thí điểm
      plantingDate: '2026-10-15',
      plantedAreaM2: -100, // Âm
    };

    expect(() => FarmerCropLogSchema.parse(invalidLog)).toThrow();
  });
});
